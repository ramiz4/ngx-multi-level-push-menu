export type DemoSnippetId = 'install' | 'component' | 'template' | 'styles';

export type DemoSnippetLanguage = 'shell' | 'typescript' | 'html' | 'scss';

export interface DemoSnippet {
  readonly id: DemoSnippetId;
  readonly step: 1 | 2 | 3 | 4;
  readonly title: string;
  readonly description: string;
  readonly language: DemoSnippetLanguage;
  readonly fileName: string;
  readonly code: string;
}

export const DEMO_SNIPPETS = [
  {
    id: 'install',
    step: 1,
    title: 'Install the package',
    description:
      'No animation module, icon library, provider, or global stylesheet is required.',
    language: 'shell',
    fileName: 'Terminal',
    code: 'npm install @ramiz4/ngx-multi-level-push-menu',
  },
  {
    id: 'component',
    step: 2,
    title: 'Define a typed menu',
    description:
      'Import the standalone component and keep application metadata type-safe.',
    language: 'typescript',
    fileName: 'app-shell.component.ts',
    code: `import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MenuActivationEvent,
  MultiLevelPushMenuComponent,
  MultiLevelPushMenuItem,
  MultiLevelPushMenuOptions,
} from '@ramiz4/ngx-multi-level-push-menu';

interface NavMetadata {
  readonly analyticsId: string;
  readonly requiresAuth?: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [MultiLevelPushMenuComponent, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly menu: readonly MultiLevelPushMenuItem<NavMetadata>[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      link: '/dashboard',
      data: { analyticsId: 'nav_dashboard', requiresAuth: true },
    },
    {
      id: 'products',
      name: 'Products',
      items: [
        {
          id: 'catalog',
          name: 'Catalog',
          link: '/products/catalog',
          data: { analyticsId: 'nav_catalog' },
        },
        {
          id: 'orders',
          name: 'Orders',
          link: '/products/orders',
          data: { analyticsId: 'nav_orders', requiresAuth: true },
        },
      ],
    },
  ];

  readonly options = new MultiLevelPushMenuOptions({
    title: 'Acme',
    ariaLabel: 'Primary navigation',
    menuWidth: '19rem',
    mode: 'cover',
    closeOnNavigation: true,
  });

  readonly activePath = signal('No destination selected');
  collapsed = false;

  onItemActivate(event: MenuActivationEvent<NavMetadata>): void {
    this.activePath.set(event.path.map((item) => item.name).join(' / '));
  }
}`,
  },
  {
    id: 'template',
    step: 3,
    title: 'Bind it in the shell',
    description:
      'Project routed content into the component and opt into controlled state only when needed.',
    language: 'html',
    fileName: 'app-shell.component.html',
    code: `<ngx-multi-level-push-menu
  [menu]="menu"
  [options]="options"
  [(collapsed)]="collapsed"
  (itemActivate)="onItemActivate($event)"
>
  <router-outlet />
</ngx-multi-level-push-menu>

<p class="selection" aria-live="polite">{{ activePath() }}</p>`,
  },
  {
    id: 'styles',
    step: 4,
    title: 'Size and theme it',
    description:
      'The menu inherits your design system through documented CSS custom properties.',
    language: 'scss',
    fileName: 'app-shell.component.scss',
    code: `:host {
  display: block;
  height: 100dvh;
}

ngx-multi-level-push-menu {
  display: block;
  height: 100%;

  --ngx-push-menu-background: #0b3d2e;
  --ngx-push-menu-surface: #115740;
  --ngx-push-menu-hover: #176b4e;
  --ngx-push-menu-active: #082d22;
  --ngx-push-menu-color: #fff;
  --ngx-push-menu-border: rgb(255 255 255 / 24%);
  --ngx-push-menu-focus: #a7f3d0;
  --ngx-push-menu-shadow: 0 0.75rem 2rem rgb(0 0 0 / 30%);
}`,
  },
] as const satisfies readonly DemoSnippet[];
