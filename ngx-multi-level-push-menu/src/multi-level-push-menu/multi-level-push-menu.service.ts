import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

import { MultiLevelPushMenuOptions, MultiLevelPushMenuItem } from './multi-level-push-menu.model';

@Injectable()
export class MultiLevelPushMenuService {

  private initSubject = new Subject<MultiLevelPushMenuOptions>();
  private updateSubject = new Subject<Array<MultiLevelPushMenuItem>>();

  initialize(options: MultiLevelPushMenuOptions) {
    this.initSubject.next(options);
  }

  initialized(): Observable<MultiLevelPushMenuOptions> {
    return this.initSubject.asObservable();
  }

  update(items: Array<MultiLevelPushMenuItem>) {
    this.updateSubject.next(items);
  }

  updated(): Observable<Array<MultiLevelPushMenuItem>> {
    return this.updateSubject.asObservable();
  }
}
