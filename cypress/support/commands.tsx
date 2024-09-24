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
            mountWithStoreAndRouter(component: ReactNode, routes: string[], options?: MountOptions): Chainable<Element>;
        }
    }
}

import React, {ReactNode} from "react";
import {Provider} from "react-redux";
import {server} from "../../src/mocks/server";
import {mockUser} from "../../src/mocks/data";
import {http, HttpResponse} from "msw";
import {produce} from "immer";
import {isaacApi, requestCurrentUser, store} from "../../src/app/state";
import {MemoryRouter} from "react-router";

Cypress.Commands.add('mountWithStoreAndRouter', (component, routes, options) => {
    store.dispatch({type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
    store.dispatch(isaacApi.util.resetApiState());
    server.resetHandlers();

    // FIXME: not hard-coded
    const role = "TEACHER" as "TEACHER" | "STUDENT" | "ADMIN" | "ANONYMOUS" | undefined;
    const modifyUser = undefined as ((u: typeof mockUser) => typeof mockUser) | undefined;

    if (role || modifyUser) {
        server.use(
            http.get(API_PATH + "/users/current_user", () => {
                if (role === "ANONYMOUS") {
                    return HttpResponse.json({
                        responseCode: 401,
                        responseCodeType: "Unauthorized",
                        errorMessage: "You must be logged in to access this resource.",
                        bypassGenericSiteErrorPage: false
                    }, {
                        status: 401,
                    });
                }
                const userWithRole = produce(mockUser, user => {
                    user.role = role ?? mockUser.role;
                });
                return HttpResponse.json(modifyUser ? modifyUser(userWithRole) : userWithRole, {
                    status: 200,
                });
            }),
        );
    }

    store.dispatch(requestCurrentUser());
    mount(
        <Provider store={store}>
            <MemoryRouter initialEntries={routes}>
                {component}
            </MemoryRouter>
        </Provider>
        , options
    );
});

import "@frsource/cypress-plugin-visual-regression-diff/dist/support";
import { ACTION_TYPE, API_PATH } from '../../src/app/services';

// Skip visual regression tests in interactive mode - the results are not consistent with headless.
// It may be useful to comment this out when debugging tests locally, but don't commit the snapshots.
if (Cypress.config('isInteractive')) {
    Cypress.Commands.add('matchImage', () => {
        cy.log('Skipping snapshot 👀');
    });
}
