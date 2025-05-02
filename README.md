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
- Built-in SVG icon support for improved performance and accessibility
- Compatible with Angular 6+ through 19+

## Installation

Install the package via npm:

```bash
npm install @ramiz4/ngx-multi-level-push-menu --save
```

## Quick Start

1. Import the module in your application:

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

2. Add the component to your template:

```html
<ramiz4-multi-level-push-menu [options]="options">
  <router-outlet></router-outlet>
</ramiz4-multi-level-push-menu>
```

3. Define your menu structure in your component:

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
    this.options.title = 'Company Name'; // Set menu title

    
    this.options.menu.items = [
      {
        name: 'Home',
        // SVG home icon
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>',
        link: 'home'
      },
      {
        name: 'Products',
        // SVG shopping bag icon
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M160 112c0-35.3 28.7-64 64-64s64 28.7 64 64v48H160V112zm-48 48H48c-26.5 0-48 21.5-48 48V416c0 53 43 96 96 96H352c53 0 96-43 96-96V208c0-26.5-21.5-48-48-48H336V112C336 50.1 285.9 0 224 0S112 50.1 112 112v48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/></svg>',
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
