import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OverviewContentService } from '../overview-content.service';

@Component({
  selector: 'ramiz4-home',
  imports: [NgTemplateOutlet],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly overview = inject(OverviewContentService);
}
