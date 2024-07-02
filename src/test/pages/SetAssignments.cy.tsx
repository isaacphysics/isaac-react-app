import {mockUser} from "../../mocks/data";
import {PATHS} from "../../app/services";
import React from "react";
import {SetAssignments} from "../../app/components/pages/SetAssignments";

it('Set Assignments should have no visual regressions', () => {
    // @ts-ignore
    cy.mountWithStoreAndRouter(<SetAssignments user={mockUser}/>, [PATHS.SET_ASSIGNMENTS]);
    cy.get('[data-testid="loading"]').should('not.exist');
    cy.matchImage();
});