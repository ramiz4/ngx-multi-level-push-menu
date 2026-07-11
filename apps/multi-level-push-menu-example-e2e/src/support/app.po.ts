export const getMenu = () => cy.getByTestId('demo-menu');

export const getActiveLevel = () =>
  getMenu().find('.ngx-push-menu__level[data-active="true"]');

export const getActiveMenuControl = (accessibleName: string) =>
  getActiveLevel().find(`[aria-label="${accessibleName}"]`);

export const getBackButton = () =>
  getActiveLevel().find('button.ngx-push-menu__back');
