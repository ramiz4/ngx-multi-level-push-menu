import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MultiLevelPushMenuItem } from './models';

/** @internal */
export type MultiLevelPushMenuCommand =
  | {
      readonly type: 'collapse';
      readonly level?: number;
      readonly targetId?: string;
    }
  | { readonly type: 'expand'; readonly targetId?: string }
  | { readonly type: 'toggle'; readonly targetId?: string }
  | {
      readonly type: 'navigate';
      readonly levelOrId: number | string;
      readonly targetId?: string;
    }
  | { readonly type: 'back'; readonly targetId?: string };

@Injectable({ providedIn: 'root' })
export class MultiLevelPushMenuService {
  private readonly commandSubject = new Subject<MultiLevelPushMenuCommand>();
  private readonly collapseSubject = new Subject<number | undefined>();
  private readonly expandSubject = new Subject<void>();
  private readonly menuItemClickSubject = new Subject<MultiLevelPushMenuItem>();
  private readonly groupItemClickSubject =
    new Subject<MultiLevelPushMenuItem>();

  /** @internal Command stream used only by menu instances. */
  readonly commands$: Observable<MultiLevelPushMenuCommand> =
    this.commandSubject.asObservable();

  /**
   * Trigger menu collapse
   */
  collapse(level?: number, targetId?: string): void {
    this.commandSubject.next({ type: 'collapse', level, targetId });
    this.collapseSubject.next(level);
  }

  /**
   * Observable for collapse events
   */
  collapsed(): Observable<number | undefined> {
    return this.collapseSubject.asObservable();
  }

  /**
   * Trigger menu expand
   */
  expand(targetId?: string): void {
    this.commandSubject.next({ type: 'expand', targetId });
    this.expandSubject.next();
  }

  /** Toggle one menu, or all menus when no target ID is supplied. */
  toggleMenu(targetId?: string): void {
    this.commandSubject.next({ type: 'toggle', targetId });
  }

  /** Alias retained for the documented API. */
  openMenu(targetId?: string): void {
    this.expand(targetId);
  }

  /** Alias retained for the documented API. */
  closeMenu(targetId?: string): void {
    this.collapse(undefined, targetId);
  }

  /** Navigate to an already open depth or to a group item by ID/name/title. */
  navigateToLevel(levelOrId: number | string, targetId?: string): void {
    this.commandSubject.next({ type: 'navigate', levelOrId, targetId });
  }

  /** Navigate one level back. */
  goBack(targetId?: string): void {
    this.commandSubject.next({ type: 'back', targetId });
  }

  /**
   * Observable for expand events
   */
  expanded(): Observable<void> {
    return this.expandSubject.asObservable();
  }

  /**
   * Emit menu item click event
   */
  menuItemClicked(item: MultiLevelPushMenuItem): void {
    this.menuItemClickSubject.next(item);
  }

  /**
   * Observable for menu item click events
   */
  onMenuItemClick(): Observable<MultiLevelPushMenuItem> {
    return this.menuItemClickSubject.asObservable();
  }

  /**
   * Emit group item click event
   */
  groupItemClicked(item: MultiLevelPushMenuItem): void {
    this.groupItemClickSubject.next(item);
  }

  /**
   * Observable for group item click events
   */
  onGroupItemClick(): Observable<MultiLevelPushMenuItem> {
    return this.groupItemClickSubject.asObservable();
  }
}
