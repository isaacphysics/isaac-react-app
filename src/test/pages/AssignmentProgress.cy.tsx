import React from "react";
import {mockUser} from "../../mocks/data";
import { AssignmentProgress } from "../../app/components/pages/AssignmentProgressWrapper";
import { PATHS } from "../../app/services";

describe('Assignment progress', () => {
    it('Groups listing should have no visual regressions', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<AssignmentProgress user={mockUser}/>, [PATHS.ASSIGNMENT_PROGRESS]);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });

    // TODO: work out how to mock withRouter() component with params

    // it('Group overview (assignment view) should have no visual regressions', () => {
    //     // @ts-ignore
    //     cy.mountWithStoreAndRouter(<AssignmentProgress user={mockUser}/>, [`${PATHS.ASSIGNMENT_PROGRESS}/group/1`]);
    //     cy.get('button').contains("Download assignments CSV").should('exist');
    //     cy.matchImage();
    // });

    // it('Group overview (test view) should have no visual regressions', () => {
    //     // @ts-ignore
    //     cy.mountWithStoreAndRouter(<AssignmentProgress user={mockUser}/>, [`${PATHS.ASSIGNMENT_PROGRESS}/group/1`]);
    //     cy.get('button').contains("Tests").click();
    //     cy.matchImage();
    // });

    // TODO: add mock data for progress details; add test on <ProgressDetails /> component
});


