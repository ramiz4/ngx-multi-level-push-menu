import { ModuleWithProviders, NgModule } from '@angular/core';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu/multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu/multi-level-push-menu.service';

/**
 * @deprecated Prefer importing the standalone MultiLevelPushMenuComponent.
 * This module remains available for existing NgModule applications.
 */
@NgModule({
  imports: [MultiLevelPushMenuComponent],
  exports: [MultiLevelPushMenuComponent],
})
export class NgxMultiLevelPushMenuModule {
  public static forRoot(): ModuleWithProviders<NgxMultiLevelPushMenuModule> {
    return {
      ngModule: NgxMultiLevelPushMenuModule,
      providers: [MultiLevelPushMenuService],
    };
  }
}
