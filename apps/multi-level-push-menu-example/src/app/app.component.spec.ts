import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';

import { NgxMultiLevelPushMenuModule } from "@ramiz4/ngx-multi-level-push-menu";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxMultiLevelPushMenuModule.forRoot()
      ],
      declarations: [AppComponent]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'multi-level-push-menu-example'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('multi-level-push-menu-example');
  });

   it('should render title', () => {
     const fixture = TestBed.createComponent(AppComponent);
     fixture.detectChanges();
     const compiled = fixture.debugElement.nativeElement;
     expect(compiled.querySelector('h1').textContent).toContain(
       'Welcome to multi-level-push-menu-example!'
     );
   });
});
