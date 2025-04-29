import { async, TestBed } from '@angular/core/testing';
import { NgxMultiLevelPushMenuModule } from './ngx-multi-level-push-menu.module';

describe('NgMultiLevelPushMenuModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxMultiLevelPushMenuModule],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgxMultiLevelPushMenuModule).toBeDefined();
  });
});
