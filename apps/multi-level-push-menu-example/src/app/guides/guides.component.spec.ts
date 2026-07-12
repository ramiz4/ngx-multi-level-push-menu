import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuidesComponent } from './guides.component';

describe('GuidesComponent', () => {
  let fixture: ComponentFixture<GuidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuidesComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(GuidesComponent);
    fixture.detectChanges();
  });

  it('renders an actionable integration guide', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(
      element.querySelector('[data-testid="route-guides"]'),
    ).not.toBeNull();
    expect(element.textContent).toContain('npm install');
    expect(element.textContent).toContain('MultiLevelPushMenuComponent');
  });
});
