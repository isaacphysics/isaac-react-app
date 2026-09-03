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
import { RegisteredUserDTO } from '../../src/IsaacApiTypes';

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            mountWithStoreAndRouter(component: ReactNode, routes: string[], initialRoute?: To, user?: RegisteredUserDTO, mountOptions?: MountOptions): Chainable<Element>;

            matchModal(): Chainable<JQuery<HTMLElement>>;
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
import { ACTION_TYPE } from '../../src/app/services';
import { v4 as uuid_v4 } from 'uuid';

Cypress.Commands.add('mountWithStoreAndRouter', (component, routes, initialRoute=routes?.[0], user, mountOptions) => {
    cy.window().then(window => {
        // createBrowserRouter errors with `TypeError: Cannot read properties of null (reading 'history')` if the global window is not defined.
        // this seems to fatally affect test setups where the "same" component is mounted across multiple tests (c.f. MyGameboards.cy.tsx),
        // presumably because there is some state that is not correctly flushed across the tests' teardown/setup.
        // 
        // wrapping the router creation in a `cy.window().then` seems to fix the issue issue with the global window not being defined;
        // passing a rerender key to the mount function fixes the issue with stale mounted components being used across tests.
        const uuid = uuid_v4();

        const router = createBrowserRouter(createRoutesFromElements(<>
            {routes?.length
                ? routes.map(route => <Route key={route} element={component} path={route} />)
                : <Route element={component} path="*" />
            }
        </>), { window });

        if (user) {
            void store.dispatch({type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS, user});
        }

        void router.navigate(initialRoute || '/');
        
        mount(
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>,
            mountOptions,
            uuid
        );
    });
});

import "@frsource/cypress-plugin-visual-regression-diff/dist/support";

// Add a delay to all matchImage calls. Shouldn't be required, but is.
Cypress.Commands.overwrite('matchImage', (matchImage) => {
    cy.wait(2000);
    matchImage();
});

Cypress.Commands.add('matchModal', () => {
    // css hack to ensure entire modal is visible on screenshot, even if the modal would require scrolling
    cy.get('body').invoke('css', 'transform', 'scale(1)');
    cy.get('[data-testid="active-modal"]').matchImage();
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
