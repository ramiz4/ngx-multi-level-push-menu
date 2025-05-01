import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MultiLevelPushMenuItem } from './models';

@Injectable()
export class MultiLevelPushMenuService {
  private collapseSubject = new Subject<number | undefined>();
  private expandSubject = new Subject<void>();
  private menuItemClickSubject = new Subject<MultiLevelPushMenuItem>();
  private groupItemClickSubject = new Subject<MultiLevelPushMenuItem>();

  /**
   * Trigger menu collapse
   */
  collapse(level?: number) {
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
  expand() {
    this.expandSubject.next();
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
  menuItemClicked(item: MultiLevelPushMenuItem) {
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
  groupItemClicked(item: MultiLevelPushMenuItem) {
    this.groupItemClickSubject.next(item);
  }

  /**
   * Observable for group item click events
   */
  onGroupItemClick(): Observable<MultiLevelPushMenuItem> {
    return this.groupItemClickSubject.asObservable();
  }
}
