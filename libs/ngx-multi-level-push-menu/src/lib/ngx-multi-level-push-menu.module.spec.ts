import { TestBed, waitForAsync } from '@angular/core/testing';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu/multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu/multi-level-push-menu.service';

describe('MultiLevelPushMenuComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MultiLevelPushMenuComponent],
      providers: [MultiLevelPushMenuService]
    }).compileComponents();
  }));

  it('should create', () => {
    const fixture = TestBed.createComponent(MultiLevelPushMenuComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});