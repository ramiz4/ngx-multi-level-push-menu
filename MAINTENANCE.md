# Maintenance Guide for ngx-multi-level-push-menu

This document provides guidance for maintaining the ngx-multi-level-push-menu package, including dependency updates, security checks, and release processes.

## Table of Contents

- [Regular Maintenance Tasks](#regular-maintenance-tasks)
- [Dependency Management](#dependency-management)
- [Security Checks](#security-checks)
- [Angular Version Compatibility](#angular-version-compatibility)
- [Build and Test Process](#build-and-test-process)
- [Release Process](#release-process)
- [Maintenance Scripts](#maintenance-scripts)

## Regular Maintenance Tasks

To keep the library in good shape, perform these maintenance tasks regularly:

| Task                              | Frequency                    | Command                   |
| --------------------------------- | ---------------------------- | ------------------------- |
| Check for outdated dependencies   | Monthly                      | `npm run maintain`        |
| Update minor dependencies         | Quarterly                    | `npm run maintain:update` |
| Run security checks               | Monthly                      | `npm run security:check`  |
| Update Angular compatibility docs | With each Angular release    | -                         |
| Run tests                         | After each dependency update | `npm run test:lib`        |

## Dependency Management

### Using the Maintenance Script

We provide a custom maintenance script to help manage dependencies:

```bash
# Check the state of dependencies
npm run maintain

# Update minor dependencies safely
npm run maintain:update
```

### Dependency Update Strategy

Follow this strategy when updating dependencies:

1. **First, update minor versions of packages**:

   ```bash
   npm update
   ```

2. **Update TypeScript and related packages together**:

   ```bash
   npm install typescript@latest ts-node@latest --save-dev
   ```

3. **Test after each significant update**:

   ```bash
   npm run test:lib
   npm run build:lib
   ```

4. **Handle breaking changes carefully**:
   - Create a branch for major updates
   - Test thoroughly with the example application
   - Update documentation to reflect any API changes

## Security Checks

Run regular security audits:

```bash
# Run security check
npm run security:check

# Apply non-breaking security fixes
npm audit fix
```

For vulnerabilities that require breaking changes:

1. Evaluate the risk level and impact on production
2. Consider handling them in a major version update
3. Document any known vulnerabilities in release notes

## Angular Version Compatibility

This library follows a versioning strategy aligned with Angular:

- Major version number matches the supported Angular major version
- Minor and patch versions follow semantic versioning

### Compatibility Table

| Library Version | Angular Version |
| --------------- | --------------- |
| 1.x.x           | 6.x - 8.x       |
| 2.x.x           | 9.x - 11.x      |
| 13.x.x - 14.x.x | 12.x - 14.x     |
| 16.x.x - 17.x.x | 15.x - 17.x     |
| 18.x.x - 19.x.x | 18.x - 19.x     |

When a new Angular version is released:

1. Test the library with the new Angular version
2. Update the compatibility table in README.md
3. Consider releasing a new major version to match Angular's version

## Build and Test Process

Always run these steps before submitting changes:

```bash
# Build the library
npm run build:lib

# Run unit tests
npm run test:lib

# Lint the code
npm run lint

# Build the example application
npm run build:app
```

## Release Process

Follow this checklist for releases:

1. **Update Documentation**:

   - Update README.md with new features
   - Update the compatibility table
   - Update CHANGELOG.md

2. **Version Bump**:

   - Major version: Breaking changes or new Angular version support
   - Minor version: New features
   - Patch version: Bug fixes or documentation updates

3. **Testing**:

   - Run all tests
   - Build the library
   - Test the example application

4. **Publishing**:

   ```bash
   # Build the library
   npm run build:lib

   # Publish to NPM
   npm run publish:ci
   ```

5. **Create GitHub Release**:
   - Tag the version
   - Write detailed release notes
   - Include upgrade guidance for breaking changes

## Maintenance Scripts

The project includes several maintenance scripts in `tools/scripts/`:

- `maintain-deps.js`: Checks and updates dependencies
- `update-nx.js`: Updates NX and related dependencies

### Using the maintain-deps.js Script

This script helps you check the current state of your dependencies and provides recommendations for updates:

```bash
# Run a basic check
npm run maintain

# Update minor versions
npm run maintain:update
```

### Using the update-nx.js Script

This script helps update NX and handles migrations:

```bash
npm run update:nx
```

---

By following this maintenance guide, you'll ensure that ngx-multi-level-push-menu remains reliable, secure, and compatible with the latest Angular versions.
