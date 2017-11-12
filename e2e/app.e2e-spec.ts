import { NgxMultiLevelPushMenuPage } from './app.po';

describe('ngx-multi-level-push-menu App', () => {
  let page: NgxMultiLevelPushMenuPage;

  beforeEach(() => {
    page = new NgxMultiLevelPushMenuPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
