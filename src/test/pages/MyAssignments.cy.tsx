import React from "react";
import {MyAssignments} from "../../app/components/pages/MyAssignments";
import {mockUser} from "../../mocks/data";
import {PATHS} from "../../app/services";


it('My Assignments should have no visual regressions', () => {
    // @ts-ignore
    cy.mountWithStoreAndRouter(<MyAssignments user={mockUser}/>, [PATHS.MY_ASSIGNMENTS]);
    cy.get('[data-testid="loading"]').should('not.exist');
    cy.matchImage();
});