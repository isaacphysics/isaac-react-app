import React from "react";
import {mockUser} from "../../mocks/data";
import {Groups} from "../../app/components/pages/Groups";

describe("Groups page", () => {
    it('should have no visual regressions on group selector', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<Groups user={mockUser}/>);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });

    it('should have no visual regressions on group editor', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<Groups user={mockUser} />);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.get('[data-testid="select-group"]').first().click();
        cy.matchImage();
    });
});

