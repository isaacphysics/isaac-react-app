import React from "react";
import {mockUser} from "../../mocks/data";
import { AssignmentProgress } from "../../app/components/pages/AssignmentProgress";


it.skip('Assignment Progress should have no visual regressions', () => {
    // @ts-ignore
    cy.mountWithStoreAndRouter(<AssignmentProgress user={mockUser}/>);
    cy.get('[data-testid="loading"]').should('not.exist');
    cy.contains("Test Group 1").click();
    cy.get('div.assignment-progress-details').should('be.visible');
    cy.wait(2000);
    cy.matchImage();
});
