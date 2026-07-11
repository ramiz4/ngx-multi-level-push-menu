import { MultiLevelPushMenuItem } from '../models';

/** Strongly typed context emitted when a menu item or group is activated. */
export interface MenuActivationEvent<TData = unknown> {
  readonly item: MultiLevelPushMenuItem<TData>;
  readonly level: number;
  readonly path: readonly MultiLevelPushMenuItem<TData>[];
  readonly originalEvent: MouseEvent | KeyboardEvent;
}
