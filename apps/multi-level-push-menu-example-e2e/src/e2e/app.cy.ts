import {
  getActiveLevel,
  getActiveMenuControl,
  getBackButton,
  getMenu,
} from '../support/app.po';

describe('multi-level push menu playground', () => {
  const assertOverlapGeometry = (
    railLabels: readonly string[],
    direction: 'ltr' | 'rtl' = 'ltr',
  ) => {
    getMenu().should(($menu) => {
      const navigation = $menu[0]?.querySelector<HTMLElement>(
        '.ngx-push-menu__navigation',
      );
      const activeLevel = $menu[0]?.querySelector<HTMLElement>(
        '.ngx-push-menu__level[data-active="true"]',
      );
      const content = $menu[0]?.querySelector<HTMLElement>(
        '.ngx-push-menu__content',
      );
      const rails = Array.from(
        $menu[0]?.querySelectorAll<HTMLButtonElement>('[data-menu-rail]') ?? [],
      );

      expect(navigation).not.to.equal(null);
      expect(activeLevel).not.to.equal(null);
      expect(content).not.to.equal(null);
      if (!navigation || !activeLevel || !content) return;

      const navigationRect = navigation.getBoundingClientRect();
      const activeRect = activeLevel.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      expect(navigationRect.width).to.be.closeTo(
        280 + railLabels.length * 40,
        1,
      );
      expect(activeRect.width).to.be.closeTo(280, 1);
      if (direction === 'ltr') {
        expect(activeRect.left).to.be.closeTo(navigationRect.left, 1);
        expect(contentRect.left).to.be.closeTo(navigationRect.right, 1);
      } else {
        expect(activeRect.right).to.be.closeTo(navigationRect.right, 1);
        expect(contentRect.right).to.be.closeTo(navigationRect.left, 1);
      }
      expect(
        rails.map((rail) => rail.getAttribute('aria-label')),
      ).to.deep.equal(railLabels);

      rails.forEach((rail, index) => {
        const railRect = rail.getBoundingClientRect();
        expect(railRect.width).to.be.closeTo(40, 1);
        if (direction === 'ltr') {
          expect(railRect.left).to.be.closeTo(activeRect.right + index * 40, 1);
        } else {
          expect(railRect.right).to.be.closeTo(activeRect.left - index * 40, 1);
        }
      });
    });
  };

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
      .should('have.css', 'left', '40px');
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

  it('stacks clickable overlap rails and paints deep mobile levels immediately', () => {
    cy.viewport(375, 812);

    getActiveMenuControl('Open Products menu').click();
    getMenu().find('[data-menu-rail]').should('not.exist');
    getMenu()
      .find('.ngx-push-menu__navigation')
      .should('have.css', 'width', '280px');
    getActiveMenuControl('Open Analytics menu').should('be.visible').click();
    getActiveLevel()
      .should('have.attr', 'aria-label', 'Analytics')
      .and('not.have.attr', 'data-entering');
    getActiveMenuControl('Live dashboard').should('be.visible');
    getBackButton().click();
    getBackButton().click();

    cy.viewport(1280, 800);
    cy.getByTestId('mode-overlap').click();
    cy.viewport(375, 812);
    getActiveMenuControl('Open Products menu').click();
    getActiveLevel()
      .should('have.attr', 'aria-label', 'Products')
      .and('not.have.attr', 'data-entering');
    getActiveMenuControl('Open Analytics menu').should('be.visible');
    assertOverlapGeometry(['Back to Nexus']);

    getActiveMenuControl('Open Analytics menu').click();
    getActiveLevel()
      .should('have.attr', 'aria-label', 'Analytics')
      .and('not.have.attr', 'data-entering');
    getActiveLevel().should(($level) => {
      const level = $level[0];
      expect(level).not.to.equal(undefined);
      if (!level) return;
      const style = getComputedStyle(level);
      const rect = level.getBoundingClientRect();
      expect(style.visibility).to.equal('visible');
      expect(style.opacity).to.equal('1');
      expect(rect.width).to.be.greaterThan(0);
      expect(rect.height).to.be.greaterThan(0);
    });
    getActiveMenuControl('Live dashboard')
      .should('be.visible')
      .should(($control) => {
        const control = $control[0];
        expect(control).not.to.equal(undefined);
        if (!control) return;
        const rect = control.getBoundingClientRect();
        const hit = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        expect(hit === control || control.contains(hit)).to.equal(true);
      });
    assertOverlapGeometry(['Back to Products', 'Back to Nexus']);

    getMenu().find('[data-menu-rail][data-target-level="1"]').click();
    getActiveLevel().should('have.attr', 'aria-label', 'Products');
    assertOverlapGeometry(['Back to Nexus']);

    getActiveMenuControl('Open Analytics menu').click();
    getMenu().find('[data-menu-rail][data-target-level="0"]').click();
    getActiveLevel().should('have.attr', 'aria-label', 'Nexus');
    getMenu().find('[data-menu-rail]').should('not.exist');

    cy.viewport(1280, 800);
    cy.getByTestId('toggle-direction').click();
    cy.viewport(375, 812);
    getActiveMenuControl('Open Products menu').click();
    getActiveMenuControl('Open Analytics menu').click();
    assertOverlapGeometry(['Back to Products', 'Back to Nexus'], 'rtl');
  });
});
