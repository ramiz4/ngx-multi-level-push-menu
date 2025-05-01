#!/usr/bin/env node

/**
 * This script helps you update NX and related dependencies in your project.
 * It first runs a migration check and then updates the dependencies.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function logHeader(message) {
  console.log(`\n${colors.bright}${colors.blue}==== ${message} ====${colors.reset}\n`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  try {
    console.log(`> ${command}`);
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    logError(`Command failed: ${command}`);
    if (!options.continueOnError) {
      process.exit(1);
    }
    return null;
  }
}

function updateNx() {
  logHeader('Checking for NX updates');
  
  try {
    // Check for migrations first
    runCommand('npx nx migrate latest', { continueOnError: true });
    
    // If migrations.json was created, run the migrations
    if (fs.existsSync(path.join(process.cwd(), 'migrations.json'))) {
      logHeader('Running migrations');
      runCommand('npx nx migrate --run-migrations');
      
      // Clean up migrations file
      logHeader('Cleaning up migration files');
      if (fs.existsSync(path.join(process.cwd(), 'migrations.json'))) {
        fs.unlinkSync(path.join(process.cwd(), 'migrations.json'));
        logSuccess('Removed migrations.json');
      }
    } else {
      logSuccess('No migrations needed');
    }

    // Install dependencies
    logHeader('Installing dependencies');
    runCommand('npm install');
    
    // Run nx --version to verify the update
    logHeader('Current NX version');
    runCommand('npx nx --version');
    
    logSuccess('NX update completed successfully');
  } catch (error) {
    logError(`Failed to update NX: ${error.message}`);
    process.exit(1);
  }
}

// Start the update process
updateNx();