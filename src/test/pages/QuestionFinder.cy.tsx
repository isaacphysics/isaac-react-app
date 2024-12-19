import React from "react";
import { QuestionFinder } from "../../app/components/pages/QuestionFinder";

it('Question finder page should have no visual regressions', () => {

    cy.mountWithStoreAndRouter(<QuestionFinder/>, ["/questions"]);

    cy.get('[data-testid="loading"]').should('not.exist');
    
    // open the filters, then the stage filter
    cy.get('[data-testid=question-finder-filters]').click();
    cy.get('[data-testid=question-finder-filters]').within(() => {
        cy.get('.collapsible-head > button').first().click();
        cy.get('input[type=checkbox]').first().click();
    });

    cy.get('button').contains('Apply filters').click();

    cy.scrollTo('top');

    cy.matchImage();
});
