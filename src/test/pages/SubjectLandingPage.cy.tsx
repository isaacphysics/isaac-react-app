import React from "react";
import { SubjectLandingPage } from "../../app/components/pages/SubjectLandingPage";
import { isPhy } from "../../app/services";

it('Subject landing pages should have no visual regressions', () => {
    if (isPhy) {
        cy.mountWithStoreAndRouter(<SubjectLandingPage/>, ['/physics/gcse']);
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    }
});
