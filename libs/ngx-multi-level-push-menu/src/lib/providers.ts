import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MultiLevelPushMenuService } from './multi-level-push-menu/multi-level-push-menu.service';

/**
 * Compatibility provider for applications that already call this helper.
 *
 * @deprecated No provider is required. MultiLevelPushMenuService is root-provided.
 */
export function provideMultiLevelPushMenu(): EnvironmentProviders {
  return makeEnvironmentProviders([MultiLevelPushMenuService]);
}
