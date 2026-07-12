import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import releaseConfig from '../../release.config.mjs';

const workspaceRoot = resolve(import.meta.dirname, '../..');
const workflowRoot = resolve(workspaceRoot, '.github/workflows');
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const workflowFiles = readdirSync(workflowRoot)
  .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
  .sort();
const workflows = workflowFiles.map((name) => ({
  content: readFileSync(resolve(workflowRoot, name), 'utf8'),
  name,
}));

for (const { content, name } of workflows) {
  for (const line of content.split('\n')) {
    const actionReference = line.match(/^\s*uses:\s*([^#\s]+)/)?.[1];
    if (actionReference === undefined || actionReference.startsWith('./')) {
      continue;
    }
    assert(
      /^[\w.-]+\/[\w.-]+(?:\/[\w.-]+)*@[0-9a-f]{40}$/.test(actionReference),
      `${name} must pin ${actionReference} to a full commit SHA.`,
    );
  }
}

const allWorkflowContent = workflows.map(({ content }) => content).join('\n');
assert(
  !/\bmaster\b/.test(allWorkflowContent),
  'GitHub workflows must target the canonical main branch only.',
);
for (const forbiddenCredential of ['secrets.NPM_TOKEN', 'secrets.GH_PAT']) {
  assert(
    !allWorkflowContent.includes(forbiddenCredential),
    `Workflows must not use the long-lived credential ${forbiddenCredential}.`,
  );
}

const releaseWorkflow = readFileSync(
  resolve(workflowRoot, 'release.yml'),
  'utf8',
);
const pagesWorkflow = readFileSync(resolve(workflowRoot, 'pages.yml'), 'utf8');
assert(
  /\bid-token:\s*write\b/.test(releaseWorkflow),
  'The release job must grant id-token: write for npm OIDC.',
);
assert(
  /\bpackage-manager-cache:\s*false\b/.test(releaseWorkflow),
  'Release builds must disable the shared package-manager cache.',
);
assert(
  /\bGITHUB_TOKEN:\s*\$\{\{\s*github\.token\s*\}\}/.test(releaseWorkflow),
  'Semantic Release must receive github.token as GITHUB_TOKEN for authenticated Git tag pushes.',
);
assert(
  !/\bGH_TOKEN:/.test(releaseWorkflow),
  'Do not pass github.token as GH_TOKEN: Semantic Release requires the x-access-token prefix selected by GITHUB_TOKEN.',
);

for (const [workflowName, workflow] of [
  ['Release', releaseWorkflow],
  ['Demo', pagesWorkflow],
]) {
  for (const guard of [
    "github.event.workflow_run.conclusion == 'success'",
    "github.event.workflow_run.event == 'push'",
    'github.event.workflow_run.head_branch == github.event.repository.default_branch',
    'github.event.workflow_run.head_repository.full_name == github.repository',
  ]) {
    assert(
      workflow.includes(guard),
      `${workflowName} must guard its privileged workflow_run job with ${guard}.`,
    );
  }
  assert(
    workflow.includes('ref: ${{ github.event.workflow_run.head_sha }}'),
    `${workflowName} must check out the exact commit validated by CI.`,
  );
}

assert(
  /\bpages:\s*write\b/.test(pagesWorkflow) &&
    /\bid-token:\s*write\b/.test(pagesWorkflow),
  'The Pages deploy job must grant only the deployment permissions it needs.',
);
assert(
  /\bpackage-manager-cache:\s*false\b/.test(pagesWorkflow) &&
    !/^\s*cache:\s*npm\s*$/m.test(pagesWorkflow),
  'Pages builds must not consume a shared package-manager cache.',
);
assert(
  pagesWorkflow.includes('BASE_HREF: ${{ steps.pages.outputs.base_path }}/') &&
    pagesWorkflow.includes('npm run prepare:pages'),
  'Pages must use the configured site base path and validate its static artifact.',
);
assert(
  /environment:\s*\n\s*name:\s*github-pages\s*\n\s*url:\s*\$\{\{\s*steps\.deployment\.outputs\.page_url\s*\}\}/.test(
    pagesWorkflow,
  ),
  'Pages deployments must report their URL through the github-pages environment.',
);

assert(
  releaseConfig.tagFormat === 'v${version}',
  'Semantic Release tags must use v${version}.',
);
assert(
  releaseConfig.branches.length === 1 && releaseConfig.branches[0] === 'main',
  'Semantic Release must default to the canonical main branch.',
);

const nxConfig = JSON.parse(
  readFileSync(resolve(workspaceRoot, 'nx.json'), 'utf8'),
);
assert(
  nxConfig.defaultBase === 'main',
  'Nx affected commands must compare against the canonical main branch.',
);
for (const pluginEntry of releaseConfig.plugins) {
  const pluginName = Array.isArray(pluginEntry) ? pluginEntry[0] : pluginEntry;
  import.meta.resolve(pluginName);
}

const npmPlugin = releaseConfig.plugins.find(
  (entry) => Array.isArray(entry) && entry[0] === '@semantic-release/npm',
);
assert(npmPlugin !== undefined, 'Missing @semantic-release/npm configuration.');
assert(
  npmPlugin[1].pkgRoot === 'dist/libs/ngx-multi-level-push-menu',
  'Semantic Release must publish the built library rather than the workspace root.',
);
assert(
  npmPlugin[1].tarballDir === 'release-artifacts',
  'Semantic Release must retain the exact npm tarball for validation and GitHub Releases.',
);

const githubPlugin = releaseConfig.plugins.find(
  (entry) => Array.isArray(entry) && entry[0] === '@semantic-release/github',
);
assert(
  githubPlugin !== undefined,
  'Missing @semantic-release/github configuration.',
);
assert(
  githubPlugin[1].failCommentCondition === false,
  'Release failures must not create GitHub issues as a secondary failure path.',
);
assert(
  githubPlugin[1].releasedLabels === false,
  'Releases must not depend on repository-specific labels.',
);

const analyzerOptions = releaseConfig.plugins.find(
  (entry) =>
    Array.isArray(entry) && entry[0] === '@semantic-release/commit-analyzer',
)?.[1];
assert(analyzerOptions !== undefined, 'Missing commit analyzer configuration.');

const logger = { log: () => undefined };
for (const [message, expectedRelease] of [
  ['fix: preserve focus after closing', 'patch'],
  ['perf: avoid redundant menu traversal', 'patch'],
  ['feat: expose controlled navigation state', 'minor'],
  ['feat!: replace the legacy imperative API', 'major'],
  ['docs: clarify standalone setup', null],
]) {
  const actualRelease = await analyzeCommits(analyzerOptions, {
    commits: [{ message }],
    logger,
  });
  assert(
    actualRelease === expectedRelease,
    `${message} should produce ${expectedRelease ?? 'no'} release, received ${actualRelease ?? 'none'}.`,
  );
}

console.log(
  `Validated ${workflowFiles.length} workflows, immutable action pins, npm OIDC, and semantic version rules.`,
);
