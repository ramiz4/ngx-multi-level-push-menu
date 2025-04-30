import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxMultiLevelPushMenuModule } from './ngx-multi-level-push-menu.module';

describe('NgMultiLevelPushMenuModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgxMultiLevelPushMenuModule],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgxMultiLevelPushMenuModule).toBeDefined();
  });
});
