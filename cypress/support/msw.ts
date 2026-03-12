// Start Mock Service Worker - we use this instead of Cypress API mocking
import { worker } from '../../src/mocks/browser';

before(() => {
    cy.wrap(
        worker.start(),
        { log: false }
    );
});

Cypress.on('test:before:run', () => {
    worker.resetHandlers();
});
