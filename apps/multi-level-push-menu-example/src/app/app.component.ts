import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  MenuActivationEvent,
  MultiLevelPushMenuComponent,
  MultiLevelPushMenuItem,
  MultiLevelPushMenuOptions,
  MultiLevelPushMenuService,
} from '@ramiz4/ngx-multi-level-push-menu';
import { DEMO_SNIPPETS, DemoSnippet, DemoSnippetId } from './demo-snippets';

type DemoEventKind = 'ready' | 'group' | 'item' | 'state';
type DemoTheme = 'aurora' | 'midnight';

interface DemoMenuData {
  readonly kind: 'route' | 'action' | 'group';
  readonly description: string;
}

interface DemoEvent {
  readonly kind: DemoEventKind;
  readonly label: string;
  readonly path: string;
  readonly depth: number;
}

const icon = (path: string): string =>
  `<svg viewBox="0 0 24 24"><path d="${path}"></path></svg>`;

const outlineIcon = (path: string): string =>
  `<svg viewBox="0 0 24 24"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.8"></path></svg>`;

const ICONS = {
  brand: icon('M4 3h7v7H4zM13 3h7v7h-7zM4 12h7v9H4zM13 12h7v9h-7z'),
  home: icon('M3 11l9-8 9 8v10h-6v-6H9v6H3z'),
  products: icon('M3 6l9-4 9 4-9 4zM3 9l9 4 9-4v9l-9 4-9-4z'),
  analytics: icon('M4 20V10h4v10zM10 20V4h4v16zM16 20v-7h4v7z'),
  commerce: outlineIcon('M3 4h2l2 11h11l2-8H7M9 20h1M17 20h1'),
  resources: icon('M4 4h7v16H4zM13 4h7v16h-7zM7 8h1M16 8h1'),
  guide: outlineIcon('M5 3h14v18H5zM8 7h8M8 11h8M8 15h5'),
  about: icon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0z'),
  spark: icon('M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z'),
} as const;

@Component({
  selector: 'ramiz4-root',
  imports: [RouterLink, RouterOutlet, MultiLevelPushMenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  private readonly menuService = inject(MultiLevelPushMenuService);

  readonly repositoryUrl =
    'https://github.com/ramiz4/ngx-multi-level-push-menu';
  readonly packageUrl =
    'https://www.npmjs.com/package/@ramiz4/ngx-multi-level-push-menu';
  readonly snippets = DEMO_SNIPPETS;
  readonly installSnippet = DEMO_SNIPPETS[0];
  readonly activeSnippetId = signal<DemoSnippetId>('component');
  readonly copiedSnippetId = signal<DemoSnippetId | null>(null);
  readonly copyStatus = signal('');
  readonly activeSnippet = computed(
    () =>
      this.snippets.find((snippet) => snippet.id === this.activeSnippetId()) ??
      this.snippets[0],
  );

  readonly menuItems: readonly MultiLevelPushMenuItem<DemoMenuData>[] = [
    {
      id: 'home',
      name: 'Overview',
      icon: ICONS.home,
      link: '/home',
      data: {
        kind: 'route',
        description: 'Return to the playground overview',
      },
    },
    {
      id: 'products',
      name: 'Products',
      icon: ICONS.products,
      ariaLabel: 'Open Products menu',
      data: {
        kind: 'group',
        description: 'Explore product areas',
      },
      items: [
        {
          id: 'analytics',
          name: 'Analytics',
          icon: ICONS.analytics,
          ariaLabel: 'Open Analytics menu',
          data: {
            kind: 'group',
            description: 'Open analytics destinations',
          },
          items: [
            {
              id: 'live-dashboard',
              name: 'Live dashboard',
              link: '/collections',
              data: {
                kind: 'route',
                description: 'Navigate to the live dashboard example',
              },
            },
            {
              id: 'scheduled-reports',
              name: 'Scheduled reports',
              link: '/collections',
              data: {
                kind: 'route',
                description: 'Navigate to reporting examples',
              },
            },
          ],
        },
        {
          id: 'commerce',
          name: 'Commerce',
          icon: ICONS.commerce,
          ariaLabel: 'Open Commerce menu',
          data: {
            kind: 'group',
            description: 'Open commerce destinations',
          },
          items: [
            {
              id: 'orders',
              name: 'Orders',
              link: '/collections',
              data: {
                kind: 'route',
                description: 'Navigate to the orders example',
              },
            },
            {
              id: 'catalog',
              name: 'Catalog',
              link: '/collections',
              data: {
                kind: 'route',
                description: 'Navigate to the catalog example',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'resources',
      name: 'Resources',
      icon: ICONS.resources,
      ariaLabel: 'Open Resources menu',
      data: {
        kind: 'group',
        description: 'Browse guides and API resources',
      },
      items: [
        {
          id: 'guides',
          name: 'Guides',
          icon: ICONS.guide,
          link: '/guides',
          data: {
            kind: 'route',
            description: 'Navigate to implementation guides',
          },
        },
        {
          id: 'release-notes',
          name: 'Release notes',
          icon: ICONS.spark,
          link: '/release-notes',
          data: {
            kind: 'route',
            description: 'See the latest library improvements',
          },
        },
      ],
    },
    {
      id: 'about',
      name: 'About the library',
      icon: ICONS.about,
      link: '/about',
      data: {
        kind: 'route',
        description: 'Learn why this component is different',
      },
    },
    {
      id: 'coming-soon',
      name: 'Coming soon',
      disabled: true,
      data: {
        kind: 'action',
        description: 'Disabled items remain accessible and inert',
      },
    },
  ];

  options = this.createDefaultOptions();

  collapsed = false;
  theme: DemoTheme = 'aurora';
  activeLevel = 0;
  lastEvent: DemoEvent = {
    kind: 'ready',
    label: 'Playground ready',
    path: 'Nexus',
    depth: 0,
  };

  setMode(mode: MultiLevelPushMenuOptions['mode']): void {
    this.updateOptions({ mode });
    this.recordState(`${mode} mode enabled`);
  }

  toggleDirection(): void {
    const direction = this.options.direction === 'ltr' ? 'rtl' : 'ltr';
    this.updateOptions({ direction });
    this.recordState(`${direction.toUpperCase()} direction enabled`);
  }

  toggleTheme(): void {
    this.theme = this.theme === 'aurora' ? 'midnight' : 'aurora';
    this.recordState(`${this.theme} theme enabled`);
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsed = collapsed;
    this.recordState(`Menu ${collapsed ? 'collapsed' : 'expanded'}`);
  }

  syncCollapsed(collapsed: boolean): void {
    this.collapsed = collapsed;
  }

  onLevelChange(level: number): void {
    this.activeLevel = level;
  }

  onItemActivate(event: MenuActivationEvent): void {
    this.recordActivation('item', event);
  }

  onGroupActivate(event: MenuActivationEvent): void {
    this.recordActivation('group', event);
  }

  setMenuWidth(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    this.updateOptions({ menuWidth: input.valueAsNumber });
    this.recordState(`Menu width set to ${input.valueAsNumber}px`);
  }

  toggleCloseOnNavigation(): void {
    const closeOnNavigation = !this.options.closeOnNavigation;
    this.updateOptions({ closeOnNavigation });
    this.recordState(
      `Close on navigation ${closeOnNavigation ? 'enabled' : 'disabled'}`,
    );
  }

  togglePreserveLevel(): void {
    const preserveActiveLevelOnCollapse =
      !this.options.preserveActiveLevelOnCollapse;
    this.updateOptions({ preserveActiveLevelOnCollapse });
    this.recordState(
      `Preserve active level ${preserveActiveLevelOnCollapse ? 'enabled' : 'disabled'}`,
    );
  }

  resetPlayground(): void {
    this.options = this.createDefaultOptions();
    this.theme = 'aurora';
    this.collapsed = false;
    this.recordState('Playground reset');
  }

  runServiceCommand(command: 'open' | 'analytics' | 'back' | 'close'): void {
    const targetId = this.options.menuID;

    switch (command) {
      case 'open':
        this.menuService.openMenu(targetId);
        break;
      case 'analytics':
        this.menuService.openMenu(targetId);
        this.menuService.navigateToLevel('analytics', targetId);
        break;
      case 'back':
        this.menuService.goBack(targetId);
        break;
      case 'close':
        this.menuService.closeMenu(targetId);
        break;
    }

    this.recordState(`Service command: ${command}`);
  }

  selectSnippet(id: DemoSnippetId): void {
    this.activeSnippetId.set(id);
    this.copiedSnippetId.set(null);
  }

  async copySnippet(snippet: DemoSnippet): Promise<void> {
    let copied = false;

    try {
      const clipboard = this.document.defaultView?.navigator.clipboard;
      if (clipboard) {
        await clipboard.writeText(snippet.code);
        copied = true;
      }
    } catch {
      // The DOM fallback below also supports browsers that deny Clipboard API.
    }

    if (!copied) copied = this.copyWithDomFallback(snippet.code);

    this.copiedSnippetId.set(copied ? snippet.id : null);
    this.copyStatus.set(
      copied
        ? `${snippet.title} copied to the clipboard.`
        : 'Copy was blocked. Select the code and copy it manually.',
    );
  }

  private updateOptions(patch: Partial<MultiLevelPushMenuOptions>): void {
    this.options = new MultiLevelPushMenuOptions({
      ...this.options,
      ...patch,
    });
  }

  private createDefaultOptions(): MultiLevelPushMenuOptions {
    return new MultiLevelPushMenuOptions({
      title: 'Nexus',
      titleIcon: ICONS.brand,
      menuID: 'nexus-demo-menu',
      ariaLabel: 'Nexus product navigation',
      menuWidth: 280,
      menuHeight: '100dvh',
      overlapWidth: 40,
      mode: 'cover',
      direction: 'ltr',
      backText: 'Back',
      closeOnNavigation: true,
      preserveActiveLevelOnCollapse: true,
      animationDuration: 500,
    });
  }

  private copyWithDomFallback(text: string): boolean {
    const textarea = this.document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    this.document.body.append(textarea);
    textarea.select();

    try {
      return this.document.execCommand('copy');
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }

  private recordActivation(
    kind: Extract<DemoEventKind, 'item' | 'group'>,
    event: MenuActivationEvent,
  ): void {
    const data = event.item.data;
    if (!this.isDemoMenuData(data)) return;

    const typedEvent = event as MenuActivationEvent<DemoMenuData>;
    this.lastEvent = {
      kind,
      label: `${typedEvent.item.name}: ${data.description}`,
      path: typedEvent.path
        .map((item) => item.name)
        .filter(Boolean)
        .join(' / '),
      depth: typedEvent.level,
    };
  }

  private recordState(label: string): void {
    this.lastEvent = {
      kind: 'state',
      label,
      path: `Nexus / level ${this.activeLevel}`,
      depth: this.activeLevel,
    };
  }

  private isDemoMenuData(value: unknown): value is DemoMenuData {
    if (!value || typeof value !== 'object') return false;

    const candidate = value as Partial<DemoMenuData>;
    return (
      (candidate.kind === 'route' ||
        candidate.kind === 'action' ||
        candidate.kind === 'group') &&
      typeof candidate.description === 'string'
    );
  }
}
