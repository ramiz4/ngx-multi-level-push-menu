#!/usr/bin/env node

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const [angularVersion, typescriptVersion] = process.argv.slice(2);
const stableSemver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

if (
  !stableSemver.test(angularVersion ?? '') ||
  !stableSemver.test(typescriptVersion ?? '')
) {
  throw new Error(
    'Usage: verify-angular-consumer.mjs <angular-version> <typescript-version>',
  );
}

const workspaceRoot = resolve(import.meta.dirname, '../..');
const distributionRoot = resolve(
  workspaceRoot,
  'dist/libs/ngx-multi-level-push-menu',
);
const packageName = JSON.parse(
  readFileSync(resolve(distributionRoot, 'package.json'), 'utf8'),
).name;
const consumerRoot = mkdtempSync(
  join(tmpdir(), `ngx-push-menu-angular-${angularVersion}-`),
);
const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmCache = join(consumerRoot, '.npm-cache');

const run = (executable, args, cwd = consumerRoot, capture = false) => {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      CYPRESS_INSTALL_BINARY: '0',
      NPM_CONFIG_CACHE: npmCache,
    },
    stdio: capture ? 'pipe' : 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(
      `${basename(executable)} ${args.join(' ')} failed with exit code ${result.status}.\n${result.stderr || ''}`,
    );
  }
  return result.stdout;
};

try {
  const packOutput = run(
    npmExecutable,
    ['pack', distributionRoot, '--pack-destination', consumerRoot, '--json'],
    workspaceRoot,
    true,
  );
  const [{ filename }] = JSON.parse(packOutput);
  const tarballPath = resolve(consumerRoot, filename);

  writeFileSync(
    resolve(consumerRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: 'ngx-push-menu-consumer-smoke-test',
        private: true,
        type: 'module',
        dependencies: {
          '@angular/common': angularVersion,
          '@angular/compiler': angularVersion,
          '@angular/compiler-cli': angularVersion,
          '@angular/core': angularVersion,
          '@angular/platform-browser': angularVersion,
          '@angular/router': angularVersion,
          [packageName]: `file:${tarballPath}`,
          rxjs: '7.8.2',
          tslib: '2.8.1',
          typescript: typescriptVersion,
        },
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    resolve(consumerRoot, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ES2022',
          moduleResolution: 'bundler',
          strict: true,
          skipLibCheck: false,
          experimentalDecorators: true,
          outDir: './out',
          types: [],
        },
        angularCompilerOptions: {
          strictInjectionParameters: true,
          strictTemplates: true,
          compilationMode: 'full',
        },
        files: ['./consumer.ts'],
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    resolve(consumerRoot, 'consumer.ts'),
    `import { Component, NgModule } from '@angular/core';
import {
  MenuActivationEvent,
  MultiLevelPushMenuComponent,
  MultiLevelPushMenuItem,
  MultiLevelPushMenuOptions,
  NgxMultiLevelPushMenuModule,
} from '${packageName}';

const menu: readonly MultiLevelPushMenuItem[] = [
  { id: 'home', name: 'Home', link: '/' },
  { id: 'products', name: 'Products', items: [{ name: 'All', link: '/products' }] },
];
const options = new MultiLevelPushMenuOptions({ title: 'Consumer menu' });

@Component({
  selector: 'consumer-standalone',
  standalone: true,
  imports: [MultiLevelPushMenuComponent],
  template: \`<ngx-multi-level-push-menu
    [menu]="menu"
    [options]="options"
    [(collapsed)]="collapsed"
    (itemActivate)="activate($event)"
  />\`,
})
export class StandaloneConsumer {
  readonly menu = menu;
  readonly options = options;
  collapsed = false;
  activate(event: MenuActivationEvent): void {
    void event.path;
  }
}

@Component({
  selector: 'consumer-ng-module',
  standalone: false,
  template: \`<ngx-multi-level-push-menu [menu]="menu" />\`,
})
export class NgModuleConsumer {
  readonly menu = menu;
}

@NgModule({
  declarations: [NgModuleConsumer],
  imports: [NgxMultiLevelPushMenuModule.forRoot()],
  exports: [NgModuleConsumer],
})
export class ConsumerModule {}
`,
  );

  run(npmExecutable, [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--strict-peer-deps',
  ]);
  run(resolve(consumerRoot, 'node_modules/.bin/ngc'), [
    '-p',
    resolve(consumerRoot, 'tsconfig.json'),
  ]);

  console.log(
    `Strict standalone and NgModule consumers compiled with Angular ${angularVersion} and TypeScript ${typescriptVersion}.`,
  );
} finally {
  rmSync(consumerRoot, { force: true, recursive: true });
}
