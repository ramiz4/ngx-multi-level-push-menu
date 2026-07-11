declare global {
  // Cypress extends its chainable API through an ambient namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('getByTestId', (testId: string) =>
  cy.get(`[data-testid="${testId}"]`),
);

export {};
