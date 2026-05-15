/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import {mount, MountOptions} from 'cypress/react';

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            mountWithStoreAndRouter(component: ReactNode, routes: string[], initialRoute?: To, mountOptions?: MountOptions): Chainable<Element>;

            openSidebar(): Chainable<JQuery<HTMLElement>>;
            closeSidebar(): Chainable<JQuery<HTMLElement>>;
            getComponent(component: keyof typeof components): Chainable<JQuery<HTMLElement>>;
        }
    }
}

import React, {ReactNode} from "react";
import {Provider} from "react-redux";
import {store} from "../../src/app/state";
import {createBrowserRouter, createRoutesFromElements, Route, To} from "react-router";
import { RouterProvider } from 'react-router-dom';

Cypress.Commands.add('mountWithStoreAndRouter', (component, routes, initialRoute=routes?.[0], mountOptions) => {
    const router = createBrowserRouter(createRoutesFromElements(<>
        {routes?.length
            ? routes.map(route => <Route key={route} element={component} path={route} />)
            : <Route path="*" element={component} />
        }
    </>));

    void router.navigate(initialRoute || '/');
    
    mount(
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>,
        mountOptions
    );
});

import "@frsource/cypress-plugin-visual-regression-diff/dist/support";

// Add a delay to all matchImage calls. Shouldn't be required, but is.
Cypress.Commands.overwrite('matchImage', (matchImage) => {
    cy.wait(2000);
    matchImage();
});

// Skip visual regression tests in interactive mode - the results are not consistent with headless.
// It may be useful to comment this out when debugging tests locally, but don't commit the snapshots.
if (Cypress.config('isInteractive')) {
    Cypress.Commands.add('matchImage', () => {
        cy.log('Skipping snapshot 👀');
    });
}

Cypress.Commands.add('openSidebar', () => {
    return cy.get('[data-testid="sidebar-toggle"]').click();
});

Cypress.Commands.add('closeSidebar', () => {
    return cy.get('[data-testid="close-sidebar-button"]').click();
});

const components = {
    "sidebar": () => cy.get('#content-sidebar-offcanvas'),
};

Cypress.Commands.add('getComponent', (component) => {
    return components[component]() || null;
});
