import React from "react";
import { Question } from "../../app/components/pages/Question";

it('Question types\' regression test page should have no visual regressions', () => {

    // the API request for the question is mocked in src/mocks/handlers.ts

    cy.mountWithStoreAndRouter(<Question questionIdOverride="_regression_test_"/>, ["/questions/_regression_test_"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    // open all accordions (that weren't already open)
    cy.get('.accordion-header > button:not(.active)').each(($el) => {
        cy.wrap($el).scrollIntoView();
        cy.wrap($el).click();
    });

    cy.scrollTo('top');

    cy.matchImage();
});
