// ***********************************************************
// This example support/component-ada.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import styles
import '../../src/scss/cs/isaac.scss';

// Start Mock Service Worker - we use this instead of Cypress API mocking
import { worker } from '../../src/mocks/browser';
Cypress.on('test:before:run:async', async () => {
  await worker.start();
});
