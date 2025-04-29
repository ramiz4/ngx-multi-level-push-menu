import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MultiLevelPushMenuComponent } from './multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';

describe('MultiLevelPushMenuComponent', () => {
  let component: MultiLevelPushMenuComponent;
  let fixture: ComponentFixture<MultiLevelPushMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [
        RouterTestingModule.withRoutes([]),
    ],
    declarations: [
        MultiLevelPushMenuComponent
    ],
    providers: [
        MultiLevelPushMenuService,
    ],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiLevelPushMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
