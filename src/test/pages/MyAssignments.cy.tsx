import React from "react";
import {MyAssignments} from "../../app/components/pages/MyAssignments";
import {mockUser} from "../../mocks/data";
import {PATHS} from "../../app/services";
import {MemoryRouter} from "react-router";
import {Provider} from "react-redux";
import { store } from "../../app/state";


it('My Assignments should render', () => {
    // @ts-ignore
    cy.mount(
        <Provider store={store}>
            <MemoryRouter initialEntries={[PATHS.MY_ASSIGNMENTS]}>
                <MyAssignments user={mockUser}/>
            </MemoryRouter>
        </Provider>
    );
});