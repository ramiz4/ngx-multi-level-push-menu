import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  e2e: {
    ...nxE2EPreset(projectRoot, {
      webServerCommands: {
        default: 'npm run start -- --configuration=development',
        production: 'npm run start -- --configuration=production',
      },
    }),
    baseUrl: 'http://localhost:4200',
  },
});
