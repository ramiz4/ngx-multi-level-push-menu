import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface ParsedSvgPath {
  readonly d: string;
  readonly fill: string;
  readonly stroke: string | null;
  readonly strokeWidth: string | null;
  readonly fillRule: 'nonzero' | 'evenodd' | null;
  readonly clipRule: 'nonzero' | 'evenodd' | null;
}

interface ParsedSvgIcon {
  readonly viewBox: string;
  readonly paths: readonly ParsedSvgPath[];
}

/** Internal, strict SVG-path renderer. It never writes consumer data to innerHTML. */
@Component({
  selector: 'ramiz4-menu-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      *ngIf="svgIcon; else classIcon"
      xmlns="http://www.w3.org/2000/svg"
      [attr.viewBox]="svgIcon.viewBox"
      aria-hidden="true"
      focusable="false"
    >
      <path
        *ngFor="let path of svgIcon.paths"
        [attr.d]="path.d"
        [attr.fill]="path.fill"
        [attr.stroke]="path.stroke"
        [attr.stroke-width]="path.strokeWidth"
        [attr.fill-rule]="path.fillRule"
        [attr.clip-rule]="path.clipRule"
      ></path>
    </svg>
    <ng-template #classIcon>
      <span *ngIf="iconClass" [class]="iconClass" aria-hidden="true"></span>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.25em;
        block-size: 1.25em;
        line-height: 1;
      }
      svg,
      span {
        display: block;
        inline-size: 1em;
        block-size: 1em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuIconComponent {
  svgIcon: ParsedSvgIcon | null = null;
  iconClass = '';

  @Input()
  set icon(value: string | undefined) {
    const icon = value?.trim() || '';
    if (!icon.startsWith('<')) {
      this.svgIcon = null;
      this.iconClass = icon.length <= 1024 ? icon : '';
      return;
    }

    this.iconClass = '';
    this.svgIcon = this.parseSvg(icon);
  }

  private parseSvg(source: string): ParsedSvgIcon | null {
    if (source.length > 100_000) return null;
    const svgMatch = source.match(/^\s*<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/i);
    if (!svgMatch) return null;

    const svgAttributes = this.parseAttributes(svgMatch[1]);
    const viewBox = svgAttributes.get('viewbox') || '0 0 24 24';
    if (!this.isSafeViewBox(viewBox)) return null;

    const paths: ParsedSvgPath[] = [];
    const pathPattern = /<path\b([^>]*)\/?\s*>/gi;
    let pathMatch: RegExpExecArray | null;
    while ((pathMatch = pathPattern.exec(svgMatch[2])) !== null) {
      if (paths.length >= 256) return null;
      const attributes = this.parseAttributes(pathMatch[1]);
      const d = attributes.get('d') || '';
      if (!this.isSafePath(d)) continue;

      paths.push({
        d,
        fill: this.safeColor(attributes.get('fill')) || 'currentColor',
        stroke: this.safeColor(attributes.get('stroke')),
        strokeWidth: this.safeNumber(attributes.get('stroke-width')),
        fillRule: this.safeRule(attributes.get('fill-rule')),
        clipRule: this.safeRule(attributes.get('clip-rule')),
      });
    }

    return paths.length > 0 ? { viewBox, paths } : null;
  }

  private parseAttributes(source: string): Map<string, string> {
    const attributes = new Map<string, string>();
    const pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? '');
    }
    return attributes;
  }

  private isSafeViewBox(value: string): boolean {
    return /^\s*-?\d*\.?\d+(?:\s+-?\d*\.?\d+){3}\s*$/.test(value);
  }

  private isSafePath(value: string): boolean {
    return (
      value.length > 0 &&
      value.length <= 20_000 &&
      /^[-MmZzLlHhVvCcSsQqTtAaEe0-9,.\s+]+$/.test(value)
    );
  }

  private safeColor(value: string | undefined): string | null {
    if (!value) return null;
    return /^(?:currentColor|none|#[\da-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\))$/i.test(
      value,
    )
      ? value
      : null;
  }

  private safeNumber(value: string | undefined): string | null {
    return value && /^\d*\.?\d+$/.test(value) ? value : null;
  }

  private safeRule(value: string | undefined): 'nonzero' | 'evenodd' | null {
    return value === 'nonzero' || value === 'evenodd' ? value : null;
  }
}
