# Contributing to ngx-multi-level-push-menu

Thank you for your interest in contributing to ngx-multi-level-push-menu! This document provides guidelines and instructions to help you contribute effectively.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

There are many ways to contribute to this project:

- Reporting bugs
- Suggesting enhancements
- Improving documentation
- Submitting code changes
- Reviewing pull requests

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- Familiarity with [Angular](https://angular.io/) and [Nx](https://nx.dev/)

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ngx-multi-level-push-menu.git
   cd ngx-multi-level-push-menu
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up the upstream remote:
   ```bash
   git remote add upstream https://github.com/ramiz4/ngx-multi-level-push-menu.git
   ```

### Development Workflow

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run the example application to test your changes:
   ```bash
   ng serve multi-level-push-menu-example
   ```

4. Run the unit tests to ensure everything is working:
   ```bash
   ng test ngx-multi-level-push-menu
   ```

5. Commit your changes following the semantic commit message format:

   | Commit Prefix | Description | Version Bump |
   |---------------|-------------|--------------|
   | `feat: `      | A new feature | Minor version bump |
   | `fix: `       | A bug fix | Patch version bump |
   | `docs: `      | Documentation only changes | Patch version bump |
   | `BREAKING CHANGE: ` | Breaking changes | Major version bump |

   Example:
   ```bash
   git commit -m "feat: add support for right-to-left languages"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Open a Pull Request (PR)

### Pull Request Process

1. Update the README.md and documentation with details of changes if applicable
2. The PR should work with the example application
3. Ensure all tests pass
4. Make sure your code follows the existing style
5. Your PR will be reviewed by maintainers

## Reporting Bugs

When reporting bugs, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment details (OS, browser, Angular version, etc.)

Use the GitHub issue tracker to report bugs.

## Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear description of the enhancement
- The motivation for the enhancement
- How it would benefit users
- Any potential implementation details

## Style Guidelines

- Follow the [Angular Style Guide](https://angular.io/guide/styleguide)
- Maintain consistent code formatting
- Write clear, readable, and maintainable code
- Include comments for complex logic
- Write comprehensive unit tests

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

## Questions?

If you have any questions, feel free to open an issue for discussion.

Thank you for your contributions!