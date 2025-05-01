#!/usr/bin/env node

/**
 * Dependency maintenance script for ngx-multi-level-push-menu
 * This script helps maintain and update package dependencies
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(
  `${colors.blue}========================================${colors.reset}`
);
console.log(
  `${colors.blue}  ngx-multi-level-push-menu Maintenance${colors.reset}`
);
console.log(
  `${colors.blue}========================================${colors.reset}`
);
console.log('');

// Run a command and return the output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    return error.stdout;
  }
}

// Check for outdated packages
function checkOutdatedPackages() {
  console.log(`${colors.cyan}Checking for outdated packages...${colors.reset}`);
  const output = runCommand('npm outdated --json');

  try {
    const outdatedPackages = JSON.parse(output || '{}');
    const packageCount = Object.keys(outdatedPackages).length;

    if (packageCount === 0) {
      console.log(`${colors.green}All packages are up to date!${colors.reset}`);
      return {};
    }

    console.log(
      `${colors.yellow}Found ${packageCount} outdated packages:${colors.reset}`
    );

    // Categorize packages
    const categories = {
      angular: [],
      typescript: [],
      testing: [],
      lint: [],
      nx: [],
      other: [],
    };

    Object.entries(outdatedPackages).forEach(([packageName, info]) => {
      const details = `${packageName}: ${info.current} → ${info.latest}`;

      if (
        packageName.includes('@angular') ||
        packageName.includes('angular-')
      ) {
        categories.angular.push(details);
      } else if (
        packageName.includes('typescript') ||
        packageName === 'ts-node'
      ) {
        categories.typescript.push(details);
      } else if (
        packageName.includes('jest') ||
        packageName.includes('cypress') ||
        packageName.includes('test')
      ) {
        categories.testing.push(details);
      } else if (
        packageName.includes('eslint') ||
        packageName.includes('prettier')
      ) {
        categories.lint.push(details);
      } else if (packageName.includes('@nx') || packageName === 'nx') {
        categories.nx.push(details);
      } else {
        categories.other.push(details);
      }
    });

    // Print categorized results
    Object.entries(categories).forEach(([category, packages]) => {
      if (packages.length > 0) {
        console.log(
          `\n${colors.magenta}${category.toUpperCase()}:${colors.reset}`
        );
        packages.forEach((pkg) => console.log(`  ${pkg}`));
      }
    });

    return outdatedPackages;
  } catch (error) {
    console.log(
      `${colors.red}Error parsing outdated packages: ${error.message}${colors.reset}`
    );
    console.log('Raw output:');
    console.log(output);
    return {};
  }
}

// Check for security vulnerabilities
function checkVulnerabilities() {
  console.log(
    `\n${colors.cyan}Checking for security vulnerabilities...${colors.reset}`
  );
  const output = runCommand('npm audit --json');

  try {
    const auditData = JSON.parse(output || '{}');

    if (auditData.vulnerabilities) {
      const totals = auditData.metadata.vulnerabilities;
      const totalVulnerabilities =
        totals.critical + totals.high + totals.moderate + totals.low;

      if (totalVulnerabilities === 0) {
        console.log(`${colors.green}No vulnerabilities found!${colors.reset}`);
      } else {
        console.log(`${colors.yellow}Found vulnerabilities:${colors.reset}`);

        if (totals.critical > 0)
          console.log(
            `  ${colors.red}Critical: ${totals.critical}${colors.reset}`
          );
        if (totals.high > 0)
          console.log(`  ${colors.red}High: ${totals.high}${colors.reset}`);
        if (totals.moderate > 0)
          console.log(
            `  ${colors.yellow}Moderate: ${totals.moderate}${colors.reset}`
          );
        if (totals.low > 0)
          console.log(`  ${colors.blue}Low: ${totals.low}${colors.reset}`);

        console.log(
          `\n${colors.yellow}Run 'npm audit' for details${colors.reset}`
        );
      }
    }
  } catch (error) {
    console.log(
      `${colors.red}Error parsing audit results: ${error.message}${colors.reset}`
    );
  }
}

// Check Angular compatibility
function checkAngularCompatibility() {
  console.log(
    `\n${colors.cyan}Checking Angular compatibility...${colors.reset}`
  );

  // Get workspace root directory
  const workspaceRoot = process.cwd();

  // Read the main package.json
  const packageJsonPath = path.join(workspaceRoot, 'package.json');
  const libPackageJsonPath = path.join(
    workspaceRoot,
    'libs/ngx-multi-level-push-menu/package.json'
  );

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const libPackageJson = JSON.parse(
      fs.readFileSync(libPackageJsonPath, 'utf8')
    );

    const angularVersion = packageJson.dependencies['@angular/core'].replace(
      /[^\d.]/g,
      ''
    );
    const libraryVersion = libPackageJson.version;

    console.log(
      `Current Angular version: ${colors.green}${angularVersion}${colors.reset}`
    );
    console.log(
      `Library version: ${colors.green}${libraryVersion}${colors.reset}`
    );

    // Check if library version matches Angular major version
    const angularMajor = angularVersion.split('.')[0];
    const libraryMajor = libraryVersion.split('.')[0];

    if (angularMajor === libraryMajor) {
      console.log(
        `${colors.green}Library and Angular versions are aligned!${colors.reset}`
      );
    } else {
      console.log(
        `${colors.yellow}Warning: Library major version (${libraryMajor}) doesn't match Angular major version (${angularMajor})${colors.reset}`
      );
      console.log(
        `Consider updating the library version to match Angular's major version.`
      );
    }
  } catch (error) {
    console.log(
      `${colors.red}Error checking Angular compatibility: ${error.message}${colors.reset}`
    );
  }
}

// Update packages (safer, minor updates)
function updateMinorPackages() {
  console.log(
    `\n${colors.cyan}Updating minor package versions...${colors.reset}`
  );

  try {
    // Using npm update to update to latest minor versions
    const output = runCommand('npm update');
    console.log(`${colors.green}Packages updated successfully!${colors.reset}`);

    // Run tests to verify everything still works
    console.log(
      `\n${colors.cyan}Running tests to verify updates...${colors.reset}`
    );
    const testOutput = runCommand('npm test');

    if (testOutput.includes('FAIL')) {
      console.log(
        `${colors.red}Some tests are failing after updates. Please check!${colors.reset}`
      );
    } else {
      console.log(
        `${colors.green}All tests passed after updates!${colors.reset}`
      );
    }
  } catch (error) {
    console.log(
      `${colors.red}Error updating packages: ${error.message}${colors.reset}`
    );
  }
}

// Show maintenance recommendations
function showRecommendations(outdatedPackages) {
  console.log(
    `\n${colors.blue}========================================${colors.reset}`
  );
  console.log(`${colors.blue}  Maintenance Recommendations${colors.reset}`);
  console.log(
    `${colors.blue}========================================${colors.reset}`
  );

  if (Object.keys(outdatedPackages).length === 0) {
    console.log(
      `${colors.green}Your project is well-maintained!${colors.reset}`
    );
    return;
  }

  // Angular-related recommendations
  const angularPackages = Object.keys(outdatedPackages).filter(
    (pkg) => pkg.includes('@angular') || pkg.includes('angular-')
  );

  if (angularPackages.length > 0) {
    console.log(`\n${colors.magenta}Angular Updates:${colors.reset}`);
    console.log(
      `There are ${angularPackages.length} Angular packages to update.`
    );
    console.log(`Recommendation: Update angular packages together using:`);
    console.log(
      `  npm update @angular/core @angular/common @angular/compiler ...`
    );
  }

  // Typescript recommendations
  if (outdatedPackages['typescript']) {
    const current = outdatedPackages['typescript'].current;
    const latest = outdatedPackages['typescript'].latest;

    console.log(`\n${colors.magenta}TypeScript Updates:${colors.reset}`);
    console.log(
      `Current TypeScript version ${current} can be updated to ${latest}.`
    );
    console.log(`This may require changes to your tsconfig files.`);
  }

  // Testing recommendations
  const testingPackages = Object.keys(outdatedPackages).filter(
    (pkg) => pkg.includes('jest') || pkg.includes('cypress')
  );

  if (testingPackages.length > 0) {
    console.log(`\n${colors.magenta}Testing Updates:${colors.reset}`);
    console.log(
      `There are ${testingPackages.length} testing packages to update.`
    );
    console.log(
      `Update testing packages with caution, as they may contain breaking changes.`
    );
  }

  // Nx recommendations
  const nxPackages = Object.keys(outdatedPackages).filter(
    (pkg) => pkg.includes('@nx') || pkg === 'nx'
  );

  if (nxPackages.length > 0) {
    console.log(`\n${colors.magenta}Nx Updates:${colors.reset}`);
    console.log(`Consider using the Nx migration process for updates:`);
    console.log(`  npx nx migrate latest`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--check') || args.length === 0) {
    const outdatedPackages = checkOutdatedPackages();
    checkVulnerabilities();
    checkAngularCompatibility();

    if (Object.keys(outdatedPackages).length > 0) {
      showRecommendations(outdatedPackages);
    }
  }

  if (args.includes('--update-minor')) {
    updateMinorPackages();
  }

  console.log(
    `\n${colors.blue}========================================${colors.reset}`
  );
  console.log(`${colors.green}Maintenance check completed!${colors.reset}`);
  console.log(
    `${colors.blue}========================================${colors.reset}`
  );
}

main();
