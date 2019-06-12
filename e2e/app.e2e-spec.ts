import { FindablePage } from './app.po';

describe('findable App', function() {
  let page: FindablePage;

  beforeEach(() => {
    page = new FindablePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
