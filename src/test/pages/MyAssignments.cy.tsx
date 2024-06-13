import React from "react";
import {MyAssignments} from "../../app/components/pages/MyAssignments";
import {mockUser} from "../../mocks/data";
import {PATHS} from "../../app/services";
import {MemoryRouter} from "react-router";
import {Provider} from "react-redux";
import { store } from "../../app/state";


it('My Assignments should render', () => {
    cy.viewport(1280, 720);

    cy.mount(
        <Provider store={store}>
            <MemoryRouter initialEntries={[PATHS.MY_ASSIGNMENTS]}>
                {
                    // @ts-ignore
                    <MyAssignments user={mockUser}/>
                }
            </MemoryRouter>
        </Provider>
    );

    cy.get('[data-testid="loading"]').should('not.exist');

    cy.matchImage();
});