const releaseBranch = process.env.RELEASE_BRANCH || 'main';

export default {
  branches: [releaseBranch],
  tagFormat: 'v${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'dist/libs/ngx-multi-level-push-menu',
        tarballDir: 'release-artifacts',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          'node tools/scripts/validate-package.mjs --release-version ${nextRelease.version}',
      },
    ],
    [
      '@semantic-release/github',
      {
        failCommentCondition: false,
        releasedLabels: false,
        assets: [
          {
            label: 'npm package tarball',
            path: 'release-artifacts/*.tgz',
          },
        ],
      },
    ],
  ],
};
