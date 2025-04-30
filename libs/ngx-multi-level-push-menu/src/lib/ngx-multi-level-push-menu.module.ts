import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { SwipeDirective } from './multi-level-push-menu/directives/swipe.directive';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu/multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu/multi-level-push-menu.service';

@NgModule({
  imports: [CommonModule],
  declarations: [
    MultiLevelPushMenuComponent,
    SwipeDirective
  ],
  exports: [
    MultiLevelPushMenuComponent,
    SwipeDirective
  ],
})
export class NgxMultiLevelPushMenuModule {
  public static forRoot(): ModuleWithProviders<NgxMultiLevelPushMenuModule> {
    return {
      ngModule: NgxMultiLevelPushMenuModule,
      providers: [MultiLevelPushMenuService],
    };
  }
}
