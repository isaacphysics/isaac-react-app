import React from "react";
import { Programmes } from "../../app/components/pages/Programmes";
import { isPhy } from "../../app/services";

describe("Programmes page", () => {
    it('should have no visual regressions', () => {
        if (isPhy) {
            cy.mountWithStoreAndRouter(<Programmes />, ['/programmes']);
            cy.get('[data-testid="loading"]').should('not.exist');
            cy.matchImage();
        }
    });
});

