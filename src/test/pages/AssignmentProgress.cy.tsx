import React from "react";
import {mockUser} from "../../mocks/data";
import { AssignmentProgress } from "../../app/components/pages/AssignmentProgressWrapper";

describe('Assignment progress', () => {
    it('Groups listing should have no visual regressions', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<AssignmentProgress user={mockUser}/>);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });

    it('Group overview (assignment view) should have no visual regressions', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<AssignmentProgress user={mockUser}/>);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.get('[data-testid="group-name"]').contains("Test Group 1").click();
        cy.get('button').contains("Download assignments CSV").should('exist');
        cy.matchImage();
    });

    it('Group overview (test view) should have no visual regressions', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<AssignmentProgress user={mockUser}/>);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.get('[data-testid="group-name"]').contains("Test Group 1").click();
        cy.get('button').contains("Tests").click();
        cy.matchImage();
    });

    // TODO: add mock data for progress details; add test on <ProgressDetails /> component
});


