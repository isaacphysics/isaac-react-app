import {AssignmentSchedule} from "../../app/components/pages/AssignmentSchedule";
import {mockUser} from "../../mocks/data";
import React from "react";

it('Assignment schedule should have no visual regressions', () => {
    // @ts-ignore
    cy.mountWithStoreAndRouter(<AssignmentSchedule user={mockUser}/>, ["assignment_schedule"]);
    cy.get('[data-testid="loading"]').should('not.exist');
    cy.get('.month-assignment-count').click();
    cy.matchImage();
});