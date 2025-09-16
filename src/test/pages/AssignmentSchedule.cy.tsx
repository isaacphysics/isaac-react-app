import {AssignmentSchedule} from "../../app/components/pages/AssignmentSchedule";
import { isPhy } from "../../app/services";
import {mockUser} from "../../mocks/data";
import React from "react";

describe('Assignment Schedule', () => {
    if (isPhy) it('should have no visual regressions', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<AssignmentSchedule user={mockUser}/>, ["assignment_schedule"]);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.get('.month-label').eq(0).click().blur();
        cy.get('.month-label').eq(1).click().blur();
        cy.matchImage();
    });
});
