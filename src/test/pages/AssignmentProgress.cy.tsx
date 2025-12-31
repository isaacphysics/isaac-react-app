import React from "react";
import { mockUser } from "../../mocks/data";
import { AssignmentProgress } from "../../app/components/pages/AssignmentProgressWrapper";
import { PATHS } from "../../app/services";
import { Route } from "react-router-dom";
import { RegisteredUserDTO } from "../../IsaacApiTypes";

describe('Assignment progress', () => {
    it('Groups listing should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<AssignmentProgressWithRoute />, [PATHS.ASSIGNMENT_PROGRESS]);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });

    it('Group overview (assignment view) should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<AssignmentProgressWithRoute />, [`${PATHS.ASSIGNMENT_PROGRESS}/group/2`]);
        cy.get('button').contains("Download assignments CSV").should('exist');
        cy.matchImage();
    });

    it('Group overview (test view) should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<AssignmentProgressWithRoute />, [`${PATHS.ASSIGNMENT_PROGRESS}/group/2`]);
        cy.get('button').contains("Tests").click();
        cy.matchImage();
    });

    it('Individual assignment view (Group Overview tab) should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<AssignmentProgressWithRoute />, [`${PATHS.ASSIGNMENT_PROGRESS}/40`]);
        cy.get('button').contains("Download CSV").should('exist');
        cy.matchImage();
    });

    it('Individual assignment view (Detailed Marks tab) should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<AssignmentProgressWithRoute />, [`${PATHS.ASSIGNMENT_PROGRESS}/40`]);
        cy.get('button').contains("Detailed marks").click();
        cy.get('div.assignment-progress-card > button').first().click('right');
        cy.wait(1000); // wait for expansion to complete
        cy.matchImage();
    });
});

const AssignmentProgressWithRoute = () => <>
    <Route path={PATHS.ASSIGNMENT_PROGRESS} element={<AssignmentProgress user={mockUser as unknown as RegisteredUserDTO}/>} />
    <Route path={`${PATHS.ASSIGNMENT_PROGRESS}/:assignmentId`} element={<AssignmentProgress user={mockUser as unknown as RegisteredUserDTO}/>} />
    <Route path={`${PATHS.ASSIGNMENT_PROGRESS}/group/:groupId`} element={<AssignmentProgress user={mockUser as unknown as RegisteredUserDTO}/>} />
</>;
