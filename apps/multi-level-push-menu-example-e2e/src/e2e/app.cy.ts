import {
  getActiveLevel,
  getActiveMenuControl,
  getBackButton,
  getMenu,
} from '../support/app.po';

describe('multi-level push menu playground', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('/');
  });

  it('navigates through nested levels and restores focus on back', () => {
    getActiveLevel().should('have.attr', 'aria-label', 'Nexus');

    getActiveMenuControl('Open Products menu').click();
    getActiveLevel().should('have.attr', 'aria-label', 'Products');
    getActiveMenuControl('Open Analytics menu').should('be.focused');
    cy.getByTestId('event-kind').should('have.text', 'group');
    cy.getByTestId('event-depth').should('have.text', '1');

    getActiveMenuControl('Open Analytics menu').click();
    getActiveLevel().should('have.attr', 'aria-label', 'Analytics');
    getActiveMenuControl('Live dashboard').should('be.focused');
    cy.getByTestId('event-path').should('have.text', 'Products / Analytics');
    cy.getByTestId('event-depth').should('have.text', '2');

    getBackButton().click();
    getActiveLevel().should('have.attr', 'aria-label', 'Products');
    getActiveMenuControl('Open Analytics menu').should('be.focused');

    getBackButton().click();
    getActiveLevel().should('have.attr', 'aria-label', 'Nexus');
    getActiveMenuControl('Open Products menu').should('be.focused');
  });

  it('routes from a deeply nested leaf and emits typed item context', () => {
    getActiveMenuControl('Open Products menu').click();
    getActiveMenuControl('Open Analytics menu').click();
    getActiveMenuControl('Live dashboard').click();

    cy.location('pathname').should('eq', '/collections');
    cy.getByTestId('route-collections').scrollIntoView();
    cy.getByTestId('route-collections').should('be.visible');
    cy.getByTestId('event-kind').should('have.text', 'item');
    cy.getByTestId('event-label').should(
      'contain.text',
      'Navigate to the live dashboard example',
    );
    cy.getByTestId('event-path').should(
      'have.text',
      'Products / Analytics / Live dashboard',
    );
  });

  it('keeps collapse and expand state controlled by the application', () => {
    getMenu().should('have.attr', 'data-collapsed', 'false');

    cy.getByTestId('collapse-menu').click();
    getMenu().should('have.attr', 'data-collapsed', 'true');
    getActiveLevel().find('.ngx-push-menu__items').should('have.attr', 'inert');
    getActiveLevel()
      .find('.ngx-push-menu__item-control')
      .should('have.attr', 'tabindex', '-1');
    cy.getByTestId('menu-state').should('contain.text', 'Collapsed');
    cy.getByTestId('event-label').should('have.text', 'Menu collapsed');

    cy.getByTestId('expand-menu').click();
    getMenu().should('have.attr', 'data-collapsed', 'false');
    cy.getByTestId('menu-state').should('contain.text', 'Expanded');
    cy.getByTestId('event-label').should('have.text', 'Menu expanded');
  });

  it('supports keyboard navigation in both writing directions', () => {
    getActiveMenuControl('Open Products menu').focus().type('{downarrow}');
    getActiveMenuControl('Open Resources menu').should('be.focused');

    getActiveMenuControl('Open Products menu').focus().type('{rightarrow}');
    getActiveLevel().should('have.attr', 'aria-label', 'Products');

    getActiveMenuControl('Open Analytics menu').focus().type('{leftarrow}');
    getActiveLevel().should('have.attr', 'aria-label', 'Nexus');

    cy.getByTestId('toggle-direction').click();
    getMenu().should('have.attr', 'data-direction', 'rtl');
    getMenu().find('nav').should('have.attr', 'dir', 'rtl');
    getMenu().find('.demo-shell').should('have.css', 'direction', 'ltr');

    getActiveMenuControl('Open Products menu').focus().type('{leftarrow}');
    getActiveLevel().should('have.attr', 'aria-label', 'Products');

    getActiveMenuControl('Open Analytics menu').focus().type('{rightarrow}');
    getActiveLevel().should('have.attr', 'aria-label', 'Nexus');
  });

  it('switches cover, overlap and theme through public inputs', () => {
    cy.getByTestId('mode-overlap').click();
    getMenu().should('have.attr', 'data-mode', 'overlap');
    cy.getByTestId('mode-overlap').should('have.attr', 'aria-pressed', 'true');

    cy.getByTestId('mode-cover').click();
    getMenu().should('have.attr', 'data-mode', 'cover');

    cy.getByTestId('toggle-theme').click();
    getMenu().should('have.attr', 'data-theme', 'midnight');
    getMenu()
      .find('.ngx-push-menu__navigation')
      .should('have.css', 'background-color', 'rgb(21, 22, 46)');
  });

  it('provides copy-ready, complete quick-start examples', () => {
    cy.window().then((window) => {
      const writeText = cy.stub().resolves();
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });
      cy.wrap(writeText).as('writeText');
    });

    cy.getByTestId('snippet-template').click();
    cy.get('[role="tabpanel"] code').should(
      'contain.text',
      '<ngx-multi-level-push-menu',
    );
    cy.getByTestId('copy-snippet').click();
    cy.getByTestId('copy-snippet').should('contain.text', 'Copied');
    cy.get('@writeText').should(
      'have.been.calledWithMatch',
      '<ngx-multi-level-push-menu',
    );
  });

  it('demonstrates targeted service control and configuration reset', () => {
    cy.getByTestId('mode-overlap').click();
    cy.getByTestId('toggle-direction').click();
    cy.getByTestId('toggle-close-on-navigation').click();

    cy.getByTestId('service-analytics').click();
    getActiveLevel().should('have.attr', 'aria-label', 'Analytics');

    cy.getByTestId('reset-playground').click();
    getMenu()
      .should('have.attr', 'data-mode', 'cover')
      .and('have.attr', 'data-direction', 'ltr')
      .and('have.attr', 'data-theme', 'aurora');
    cy.getByTestId('toggle-close-on-navigation').should(
      'have.attr',
      'aria-pressed',
      'false',
    );
  });

  it('keeps the complete demo usable without horizontal overflow on mobile', () => {
    cy.viewport(375, 812);
    cy.visit('/');

    getActiveLevel().find('[data-menu-toggle]').click();
    getMenu().should('have.attr', 'data-collapsed', 'true');
    getMenu()
      .find('.ngx-push-menu__content')
      .should('have.css', 'left', '52px');
    cy.get('h1').should('be.visible');
    cy.getByTestId('snippet-install').click();
    cy.get('[role="tabpanel"]').scrollIntoView();
    cy.get('[role="tabpanel"]').should('be.visible');
    cy.window().then((window) => {
      expect(window.document.documentElement.scrollWidth).to.be.at.most(
        window.innerWidth,
      );
    });
  });

  it('keeps overlap visually distinct from cover on mobile', () => {
    cy.getByTestId('mode-overlap').click();
    cy.viewport(375, 812);

    getActiveMenuControl('Open Products menu').click();
    getMenu()
      .find('.ngx-push-menu__level[data-level-index="0"]')
      .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
    getActiveLevel().should(
      'have.css',
      'transform',
      'matrix(1, 0, 0, 1, 52, 0)',
    );
    getActiveMenuControl('Open Analytics menu').should('be.visible');
  });
});
