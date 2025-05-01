# ngx-multi-level-push-menu

A modern, accessible Angular component for responsive multi-level push menus with extensive customization options.

<a href="https://badge.fury.io/js/@ramiz4%2Fngx-multi-level-push-menu"><img src="https://badge.fury.io/js/@ramiz4%2Fngx-multi-level-push-menu.svg" alt="npm version" height="18"></a>
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Responsive multi-level push menu for Angular applications
- Accessibility-enhanced with ARIA attributes and keyboard navigation
- Endless nesting capability for navigation elements
- Left-to-right and Right-to-left sliding directions
- Customizable animation effects
- Two menu modes: overlap and cover
- Swipe gesture support (configurable for touch, desktop, or both)
- Router integration
- Comprehensive styling options
- Support for Font Awesome icons (4.x, 5.x, and 6.x)
- Compatible with Angular 6+ through 19+

## Installation

Install the package via npm:

```bash
npm install @ramiz4/ngx-multi-level-push-menu --save
```

Install required dependencies:

```bash
# For Font Awesome 4.x
npm install font-awesome --save

# OR for Font Awesome 5+/6+ (recommended for newer projects)
npm install @fortawesome/fontawesome-free --save
```

## Quick Start

1. Update your `angular.json` to include Font Awesome:

```json
"styles": [
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "styles.css"
],
```

2. Import the module in your application:

### For NgModule-based applications:

```typescript
import { NgxMultiLevelPushMenuModule } from '@ramiz4/ngx-multi-level-push-menu';

@NgModule({
  imports: [
    // ...other imports
    NgxMultiLevelPushMenuModule.forRoot()
  ]
  // ...
})
export class AppModule {}
```

### For standalone applications (Angular 14+):

```typescript
// In app.config.ts or equivalent
import { ApplicationConfig } from '@angular/core';
import { provideMultiLevelPushMenu } from '@ramiz4/ngx-multi-level-push-menu';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...other providers
    provideMultiLevelPushMenu(),
  ]
};
```

```typescript
// In your component
import { Component } from '@angular/core';
import { MultiLevelPushMenuComponent } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  // ...
  standalone: true,
  imports: [MultiLevelPushMenuComponent]
})
export class AppComponent {
  // ...
}
```

3. Add the component to your template:

```html
<ramiz4-multi-level-push-menu [options]="options">
  <router-outlet></router-outlet>
</ramiz4-multi-level-push-menu>
```

4. Define your menu structure in your component:

```typescript
import { Component, OnInit } from '@angular/core';
import { MultiLevelPushMenuService, MultiLevelPushMenuOptions } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  options = new MultiLevelPushMenuOptions();

  constructor(private menuService: MultiLevelPushMenuService) {}

  ngOnInit() {
    this.options.menu = {
      title: 'All Categories',
      id: 'menu',
      icon: 'fas fa-bars'
    };
    
    this.options.menu.items = [
      {
        name: 'Home',
        icon: 'fas fa-home',
        link: 'home'
      },
      {
        name: 'Products',
        icon: 'fas fa-shopping-bag',
        items: [
          {
            name: 'Electronics',
            items: [
              { name: 'Smartphones', link: 'smartphones' },
              { name: 'Laptops', link: 'laptops' }
            ]
          }
        ]
      }
    ];
  }

  collapseMenu() {
    this.menuService.collapse();
  }

  expandMenu() {
    this.menuService.expand();
  }
}
```

## Example Application

See the example application in the [`apps/multi-level-push-menu-example`](apps/multi-level-push-menu-example) folder for a complete usage example.

To run the example:

```bash
ng serve multi-level-push-menu-example
```

## Documentation

For detailed API documentation, configuration options, and advanced usage, see the library README in the `libs/ngx-multi-level-push-menu` directory.

## Development

This project was generated using [Nx](https://nx.dev).

### Development server

Run `ng serve multi-level-push-menu-example` for a dev server. Navigate to http://localhost:4200/.

### Build the library

Run `ng build ngx-multi-level-push-menu` to build the library.

### Running unit tests

Run `ng test ngx-multi-level-push-menu` to execute the unit tests via [Jest](https://jestjs.io).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

#### Semantic Commit Messages

This project uses semantic commit messages to automate version bumping:

| Commit Prefix | Description | Version Bump |
|---------------|-------------|--------------|
| `feat: `      | A new feature | Minor version bump |
| `fix: `       | A bug fix | Patch version bump |
| `docs: `      | Documentation only changes | Patch version bump |
| `BREAKING CHANGE: ` | Breaking changes | Major version bump |

## License

MIT © [Ramiz Loki](https://ramizloki.com)
