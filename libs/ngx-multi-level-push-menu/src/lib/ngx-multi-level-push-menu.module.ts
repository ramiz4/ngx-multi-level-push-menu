import { NgModule } from '@angular/core';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu/multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu/multi-level-push-menu.service';

/**
 * @deprecated Use standalone imports instead. This module is kept for backward compatibility.
 */
@NgModule({
  imports: [MultiLevelPushMenuComponent],
  exports: [MultiLevelPushMenuComponent],
})
export class NgxMultiLevelPushMenuModule {
  public static forRoot() {
    return {
      ngModule: NgxMultiLevelPushMenuModule,
      providers: [MultiLevelPushMenuService],
    };
  }
}
