import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu.component';

@Component({
  selector: 'ramiz4-ssr-test-root',
  standalone: true,
  imports: [MultiLevelPushMenuComponent],
  template: `
    <ngx-multi-level-push-menu
      [menu]="[{ name: 'Server item', items: [{ name: 'Nested item' }] }]"
    >
      <p>Server-rendered content</p>
    </ngx-multi-level-push-menu>
  `,
})
class SsrTestRootComponent {}

describe('MultiLevelPushMenuComponent SSR', () => {
  it('renders without browser globals or imperative DOM construction', async () => {
    const html = await renderApplication(
      (context) =>
        bootstrapApplication(SsrTestRootComponent, { providers: [] }, context),
      {
        document:
          '<!doctype html><html><body><ramiz4-ssr-test-root></ramiz4-ssr-test-root></body></html>',
        url: 'http://localhost/',
        allowedHosts: ['localhost'],
      },
    );

    expect(html).toContain('Server item');
    expect(html).toContain('Server-rendered content');
    expect(html).toContain('aria-label="Main navigation"');
  });
});
