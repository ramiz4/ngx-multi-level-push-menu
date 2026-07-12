import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleaseNotesComponent } from './release-notes.component';

describe('ReleaseNotesComponent', () => {
  let fixture: ComponentFixture<ReleaseNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleaseNotesComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ReleaseNotesComponent);
    fixture.detectChanges();
  });

  it('renders the current release and its improvements', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(
      element.querySelector('[data-testid="route-release-notes"]'),
    ).not.toBeNull();
    expect(element.textContent).toContain('20.2.2');
    expect(element.textContent).toContain('Stable overlap content geometry');
  });
});
