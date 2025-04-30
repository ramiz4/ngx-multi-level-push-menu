# ngx-multi-level-push-menu

Angular component for a responsive multi-level push menu.

[![npm version](https://badge.fury.io/js/%40ramiz4%2Fngx-multi-level-push-menu.svg)](https://badge.fury.io/js/%40ramiz4%2Fngx-multi-level-push-menu)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Responsive multi-level push menu for Angular applications
- Customizable styling and animations
- Support for nested menu items
- Router integration
- Font Awesome icons support

## Installation

Install the package via npm:

```bash
npm install @ramiz4/ngx-multi-level-push-menu --save
```

Make sure you have the peer dependencies installed:

```bash
npm install font-awesome@4.7.0 --save
```

## Usage

1. Import the module in your app.module.ts:

```typescript
import { NgxMultiLevelPushMenuModule } from '@ramiz4/ngx-multi-level-push-menu';

@NgModule({
  imports: [
    // ...other imports
    NgxMultiLevelPushMenuModule,
  ],
  // ...
})
export class AppModule {}
```

2. Add the component to your template:

```html
<ngx-multi-level-push-menu [menu]="menuItems" [options]="menuOptions"></ngx-multi-level-push-menu>
```

3. Define your menu structure in your component:

```typescript
export class AppComponent {
  menuItems = [
    {
      name: 'Home',
      link: '/home',
      icon: 'fa fa-home',
    },
    {
      name: 'Collections',
      icon: 'fa fa-collection',
      items: [
        {
          name: 'Collection 1',
          link: '/collections/1',
        },
        {
          name: 'Collection 2',
          link: '/collections/2',
        },
      ],
    },
    // Add more menu items as needed
  ];

  menuOptions = {
    // Optional configuration options
    // Example:
    // collapsed: false,
    // width: 300,
    // showBackLink: true
  };
}
```

## API Documentation

### Inputs

| Name    | Type   | Default | Description           |
| ------- | ------ | ------- | --------------------- |
| menu    | Array  | []      | Array of menu items   |
| options | Object | {}      | Configuration options |

### Menu Item Properties

| Name  | Type   | Description                        |
| ----- | ------ | ---------------------------------- |
| name  | string | Display name of the menu item      |
| link  | string | Optional router link               |
| icon  | string | Optional icon class (Font Awesome) |
| items | Array  | Optional array of child menu items |

### Options

| Name         | Type    | Default | Description                           |
| ------------ | ------- | ------- | ------------------------------------- |
| collapsed    | boolean | false   | Initial menu state                    |
| width        | number  | 300     | Width of the menu in pixels           |
| showBackLink | boolean | true    | Show back link for submenu navigation |

## Example Application

See the example application in the `apps/multi-level-push-menu-example` folder for a complete usage example.

To run the example:

```bash
ng serve multi-level-push-menu-example
```

## Development

This project was generated using [Nx](https://nx.dev).

### Development server

Run `ng serve multi-level-push-menu-example` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

### Build the library

Run `ng build ngx-multi-level-push-menu` to build the library. The build artifacts will be stored in the `dist/libs/ngx-multi-level-push-menu` directory.

### Running unit tests

Run `ng test ngx-multi-level-push-menu` to execute the unit tests via [Jest](https://jestjs.io).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Development Workflow

### Semantic Commit Messages

This project uses semantic commit messages to automate version bumping. When you create a commit, use one of the following prefixes to indicate the type of change:

| Commit Prefix | Description | Version Bump |
|---------------|-------------|--------------|
| `feat: `      | A new feature | Minor version bump |
| `fix: `       | A bug fix | Patch version bump |
| `docs: `      | Documentation only changes | Patch version bump |
| `style: `     | Changes that do not affect the meaning of the code | Patch version bump |
| `refactor: `  | Code changes that neither fix a bug nor add a feature | Patch version bump |
| `perf: `      | Code changes that improve performance | Patch version bump |
| `test: `      | Adding or correcting tests | Patch version bump |
| `chore: `     | Changes to the build process or auxiliary tools | Patch version bump |

To trigger a **major version** bump, include the phrase `BREAKING CHANGE` or `major` in your commit message.

Examples:
```
feat: add new menu animation feature
fix: resolve issue with menu not closing
docs: update API documentation
feat: add new API with BREAKING CHANGE
```

### Automated Version Bumping

The project uses GitHub Actions to automate version bumping when changes are merged to the master branch. The workflow does the following:

1. When code is merged to `master`, it automatically determines the type of version bump based on commit messages
2. Updates all package.json files with the new version number
3. Commits the version changes and creates a git tag
4. Pushes the changes back to the repository
5. Creates a new npm release when a tag is pushed

This automation ensures that the version is always properly incremented according to semantic versioning principles, and that the npm package is kept up to date with the latest changes.

## License

MIT © [Ramiz Loki](https://ramizloki.com)
