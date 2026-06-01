import React from "react";
import { Question } from "../../app/components/pages/Question";

it('Question types\' regression test page (part 1) should have no visual regressions', () => {

    // the API request for the question is mocked in src/mocks/handlers.ts

    cy.mountWithStoreAndRouter(<Question questionIdOverride="_regression_test_1_"/>, ["/questions/_regression_test_1_"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    // open all accordions (that weren't already open)
    cy.get('.isaac-accordion > button.accordion-header:not(.active)').each(($el) => {
        cy.wrap($el).scrollIntoView();
        cy.wrap($el).click({scrollBehavior: false});
    });

    cy.focused().blur();
    cy.get('#page-title').scrollIntoView();

    cy.matchImage();
});

it('Question types\' regression test page (part 2) should have no visual regressions', () => {

    cy.mountWithStoreAndRouter(<Question questionIdOverride="_regression_test_2_"/>, ["/questions/_regression_test_2_"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    // open all accordions (that weren't already open)
    cy.get('.isaac-accordion > button.accordion-header:not(.active)').each(($el) => {
        cy.wrap($el).scrollIntoView();
        cy.wrap($el).click({scrollBehavior: false});
    });

    cy.focused().blur();
    cy.get('#page-title').scrollIntoView();

    cy.matchImage();
});
