import { BookwormsHubPage } from './app.po';

describe('bookworms-hub App', () => {
  let page: BookwormsHubPage;

  beforeEach(() => {
    page = new BookwormsHubPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
