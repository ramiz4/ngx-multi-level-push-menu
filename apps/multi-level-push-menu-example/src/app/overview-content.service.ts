import { Injectable, signal, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverviewContentService {
  readonly template = signal<TemplateRef<unknown> | null>(null);

  register(template: TemplateRef<unknown>): void {
    this.template.set(template);
  }
}
