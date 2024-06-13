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
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from 'cypress/react'

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Example use:
// cy.mount(<MyComponent />)

// Import styles
import '../../src/scss/phy/isaac.scss';

// Start Mock Service Worker
import { worker } from '../../src/mocks/browser';
Cypress.on('test:before:run:async', async () => {
  await worker.start();
});

// Skip visual regression tests in interactive mode - the results are not consistent with headless.
// It may be useful to comment this out when debugging tests locally, but don't commit the snapshots.
if (Cypress.config('isInteractive')) {
  Cypress.Commands.add('matchImage', () => {
    cy.log('Skipping snapshot 👀');
  });
}
