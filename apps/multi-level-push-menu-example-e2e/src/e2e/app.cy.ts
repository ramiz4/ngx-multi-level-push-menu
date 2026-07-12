import {
  getActiveLevel,
  getActiveMenuControl,
  getBackButton,
  getMenu,
} from '../support/app.po';

describe('multi-level push menu playground', () => {
  const assertCollapsedHandleSettled = () => {
    getMenu().should(($menu) => {
      const menuRect = $menu[0].getBoundingClientRect();
      const handle = $menu[0].querySelector<HTMLElement>(
        '[data-menu-collapsed-toggle]',
      );
      expect(handle).not.to.equal(null);
      if (!handle) return;

      const handleRect = handle.getBoundingClientRect();
      const wrapper = $menu[0].querySelector<HTMLElement>('.ngx-push-menu');
      const wrapperRect = wrapper?.getBoundingClientRect();
      const offsetParentRect = (
        handle.offsetParent as HTMLElement | null
      )?.getBoundingClientRect();
      const details = JSON.stringify({
        direction: $menu.attr('data-direction'),
        handle: {
          left: handleRect.left,
          right: handleRect.right,
          width: handleRect.width,
        },
        inlineStyle: handle.getAttribute('style'),
        computedLeft: getComputedStyle(handle).left,
        computedRight: getComputedStyle(handle).right,
        menu: { left: menuRect.left, right: menuRect.right },
        wrapper: wrapperRect
          ? {
              left: wrapperRect.left,
              right: wrapperRect.right,
              scrollLeft: wrapper?.scrollLeft,
            }
          : null,
        offsetParent: offsetParentRect
          ? { left: offsetParentRect.left, right: offsetParentRect.right }
          : null,
      });
      expect(handleRect.width).to.be.closeTo(56, 1);
      if ($menu.attr('data-direction') === 'rtl') {
        expect(handleRect.right, details).to.be.closeTo(menuRect.right, 1);
      } else {
        expect(handleRect.left, details).to.be.closeTo(menuRect.left, 1);
      }
    });
  };

  const closeFromOutside = () => {
    getMenu().find('[data-menu-backdrop]').click();
    getMenu().should('have.attr', 'data-collapsed', 'true');
    assertCollapsedHandleSettled();
  };

  const expandFromHandle = () => {
    assertCollapsedHandleSettled();
    getMenu()
      .find('[data-menu-collapsed-toggle]')
      .should('be.visible')
      .then(($handle) => {
        const handle = $handle[0];
        const rect = handle.getBoundingClientRect();
        const hit = handle.ownerDocument.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        expect(hit === handle || handle.contains(hit)).to.equal(true);
        handle.click();
      });
    getMenu().should('have.attr', 'data-collapsed', 'false');
  };

  const toggleDirection = (expected: 'ltr' | 'rtl') => {
    cy.getByTestId('toggle-direction').then(($toggle) => {
      $toggle[0].scrollIntoView({ block: 'center' });
      $toggle[0].click();
    });
    getMenu().should('have.attr', 'data-direction', expected);
  };

  const activateRail = (targetLevel: number) => {
    getMenu()
      .find(`[data-menu-rail][data-target-level="${targetLevel}"]`)
      .should('be.visible')
      .then(($rail) => {
        const rail = $rail[0];
        rail.click();
      });
  };

  const assertFullWidthContent = (expectedOffset: number) => {
    getMenu().should(($menu) => {
      const menuRect = $menu[0]?.getBoundingClientRect();
      const contentRect = $menu[0]
        ?.querySelector<HTMLElement>('.ngx-push-menu__content')
        ?.getBoundingClientRect();
      expect(menuRect).not.to.equal(undefined);
      expect(contentRect).not.to.equal(undefined);
      if (!menuRect || !contentRect) return;
      expect(contentRect.width).to.be.closeTo(menuRect.width, 1);
      expect(contentRect.left).to.be.closeTo(menuRect.left + expectedOffset, 1);
    });
  };

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
      const menuRect = $menu[0].getBoundingClientRect();
      expect(navigationRect.width).to.be.closeTo(
        280 + railLabels.length * 40,
        1,
      );
      expect(activeRect.width).to.be.closeTo(280, 1);
      expect(contentRect.width).to.be.closeTo(menuRect.width, 1);
      expect(contentRect.left).to.be.closeTo(menuRect.left, 1);
      expect(contentRect.right).to.be.closeTo(menuRect.right, 1);
      if (direction === 'ltr') {
        expect(activeRect.left).to.be.closeTo(navigationRect.left, 1);
      } else {
        expect(activeRect.right).to.be.closeTo(navigationRect.right, 1);
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
    cy.get('#demo-heading').should('not.exist');
    getMenu().should('have.attr', 'data-collapsed', 'true');
  });

  it('routes documentation items to useful about, guide and release pages', () => {
    getActiveMenuControl('About the library').click();
    cy.location('pathname').should('eq', '/about');
    cy.getByTestId('route-about').scrollIntoView();
    cy.getByTestId('route-about')
      .should('be.visible')
      .and('contain.text', 'Accessible by default');
    cy.get('#demo-heading').should('not.exist');

    expandFromHandle();
    getActiveMenuControl('Open Resources menu').click();
    getActiveMenuControl('Guides').click();
    cy.location('pathname').should('eq', '/guides');
    cy.getByTestId('route-guides').scrollIntoView();
    cy.getByTestId('route-guides')
      .should('be.visible')
      .and('contain.text', 'npm install');
    cy.get('#demo-heading').should('not.exist');

    expandFromHandle();
    getActiveMenuControl('Release notes').click();
    cy.location('pathname').should('eq', '/release-notes');
    cy.getByTestId('route-release-notes').scrollIntoView();
    cy.getByTestId('route-release-notes')
      .should('be.visible')
      .and('contain.text', '20.0.6');
    cy.get('#demo-heading').should('not.exist');

    expandFromHandle();
    getActiveMenuControl('Overview').click();
    cy.location('pathname').should('eq', '/home');
    cy.get('#demo-heading')
      .should('be.visible')
      .and('contain.text', 'Deep navigation');
    cy.getByTestId('route-release-notes').should('not.exist');
  });

  it('keeps collapse and expand state controlled by the application', () => {
    getMenu().should('have.attr', 'data-collapsed', 'false');

    closeFromOutside();
    getMenu().should('have.attr', 'data-collapsed', 'true');
    getActiveLevel().find('.ngx-push-menu__items').should('have.attr', 'inert');
    getActiveLevel()
      .find('.ngx-push-menu__item-control')
      .should('have.attr', 'tabindex', '-1');
    cy.getByTestId('menu-state').should('contain.text', 'Collapsed');

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

    closeFromOutside();
    toggleDirection('rtl');
    expandFromHandle();
    getMenu().should('have.attr', 'data-direction', 'rtl');
    getMenu().find('nav').should('have.attr', 'dir', 'rtl');
    getMenu().find('.demo-shell').should('have.css', 'direction', 'ltr');

    getActiveMenuControl('Open Products menu').focus().type('{leftarrow}');
    getActiveLevel().should('have.attr', 'aria-label', 'Products');

    getActiveMenuControl('Open Analytics menu').focus().type('{rightarrow}');
    getActiveLevel().should('have.attr', 'aria-label', 'Nexus');
  });

  it('switches cover, overlap and theme through public inputs', () => {
    closeFromOutside();
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
    closeFromOutside();
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
    closeFromOutside();
    cy.getByTestId('mode-overlap').click();
    toggleDirection('rtl');
    cy.getByTestId('toggle-close-on-navigation').click();

    cy.getByTestId('service-analytics').click();
    getActiveLevel().should('have.attr', 'aria-label', 'Analytics');

    closeFromOutside();
    cy.getByTestId('reset-playground').click();
    getMenu()
      .should('have.attr', 'data-mode', 'cover')
      .and('have.attr', 'data-direction', 'ltr')
      .and('have.attr', 'data-theme', 'aurora');
    cy.getByTestId('toggle-close-on-navigation').should(
      'have.attr',
      'aria-pressed',
      'true',
    );
  });

  it('keeps the complete demo usable without horizontal overflow on mobile', () => {
    cy.viewport(375, 812);
    cy.visit('/');

    assertFullWidthContent(280);
    closeFromOutside();
    assertFullWidthContent(0);
    getMenu().should(($menu) => {
      const menuRect = $menu[0].getBoundingClientRect();
      const handleRect = $menu[0]
        .querySelector<HTMLElement>('[data-menu-collapsed-toggle]')
        ?.getBoundingClientRect();
      expect(handleRect).not.to.equal(undefined);
      if (!handleRect) return;
      expect(handleRect.width).to.be.closeTo(56, 1);
      expect(handleRect.left).to.be.at.least(menuRect.left);
      expect(handleRect.right).to.be.at.most(menuRect.right);
    });
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

  it('keeps content full-width in cover and overlap for LTR and RTL', () => {
    cy.viewport(375, 812);

    assertFullWidthContent(280);
    closeFromOutside();
    assertFullWidthContent(0);

    toggleDirection('rtl');
    expandFromHandle();
    assertFullWidthContent(-280);
    closeFromOutside();
    assertFullWidthContent(0);

    cy.getByTestId('mode-overlap').click();
    expandFromHandle();
    assertFullWidthContent(0);
    closeFromOutside();
  });

  it('keeps entering and exiting panels mounted for the complete motion', () => {
    cy.viewport(375, 812);

    getActiveMenuControl('Open Products menu').click();
    getActiveLevel()
      .should('have.attr', 'aria-label', 'Products')
      .and('have.attr', 'data-entering', 'true')
      .then(($level) => {
        const style = getComputedStyle($level[0]);
        expect(style.animationName).to.contain('ngx-push-menu-enter');
        expect(style.animationDuration).to.equal('0.5s');
      });
    getActiveLevel().should('not.have.attr', 'data-entering');

    getBackButton().click();
    getActiveLevel().should('have.attr', 'aria-label', 'Nexus');
    getMenu()
      .find('.ngx-push-menu__level[data-exiting="true"]')
      .should('have.attr', 'aria-label', 'Products')
      .and('have.attr', 'aria-hidden', 'true')
      .then(($level) => {
        const style = getComputedStyle($level[0]);
        expect(style.animationName).to.contain('ngx-push-menu-exit');
        expect(style.animationDuration).to.equal('0.5s');
      });
    getMenu()
      .find('.ngx-push-menu__level[data-exiting="true"]')
      .should('not.exist');
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
    closeFromOutside();
    cy.getByTestId('mode-overlap').click();
    expandFromHandle();
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
        const hit = control.ownerDocument.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        expect(hit === control || control.contains(hit)).to.equal(true);
      });
    assertOverlapGeometry(['Back to Products', 'Back to Nexus']);

    activateRail(1);
    getActiveLevel().should('have.attr', 'aria-label', 'Products');
    assertOverlapGeometry(['Back to Nexus']);

    getActiveMenuControl('Open Analytics menu').click();
    activateRail(0);
    getActiveLevel().should('have.attr', 'aria-label', 'Nexus');
    getMenu().find('[data-menu-rail]').should('not.exist');

    cy.viewport(1280, 800);
    closeFromOutside();
    toggleDirection('rtl');
    expandFromHandle();
    cy.viewport(375, 812);
    getActiveMenuControl('Open Products menu').click();
    getActiveMenuControl('Open Analytics menu').click();
    assertOverlapGeometry(['Back to Products', 'Back to Nexus'], 'rtl');
  });
});
