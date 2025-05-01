import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MultiLevelPushMenuService } from './multi-level-push-menu/multi-level-push-menu.service';
import { DeviceDetectorService } from './multi-level-push-menu/services/device-detector.service';

/**
 * Provides the necessary services for the Multi-Level Push Menu component
 * to work in a standalone application.
 *
 * @returns The providers needed for the Multi-Level Push Menu
 */
export function provideMultiLevelPushMenu(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MultiLevelPushMenuService,
    DeviceDetectorService,
  ]);
}
