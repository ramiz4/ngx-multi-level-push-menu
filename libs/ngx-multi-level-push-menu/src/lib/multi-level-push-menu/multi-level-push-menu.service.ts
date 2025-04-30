import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MultiLevelPushMenuService {
  private collapseSubject = new Subject<number | undefined>();
  private expandSubject = new Subject<void>();

  collapse(level?: number) {
    this.collapseSubject.next(level);
  }

  collapsed(): Observable<number | undefined> {
    return this.collapseSubject.asObservable();
  }

  expand() {
    this.expandSubject.next();
  }

  expanded(): Observable<void> {
    return this.expandSubject.asObservable();
  }
}
