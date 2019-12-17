import { async, TestBed } from '@angular/core/testing';
import { NgMultiLevelPushMenuModule } from './ngx-multi-level-push-menu.module';

describe('NgMultiLevelPushMenuModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgMultiLevelPushMenuModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgMultiLevelPushMenuModule).toBeDefined();
  });
});
