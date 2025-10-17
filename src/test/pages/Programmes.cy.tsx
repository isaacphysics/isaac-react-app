import React from "react";
import { Programmes } from "../../app/components/pages/Programmes";

describe("Programmes page", () => {
    it('should have no visual regressions', () => {
        cy.mountWithStoreAndRouter(<Programmes />, ['/programmes']);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });
});

