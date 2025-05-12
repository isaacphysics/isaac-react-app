import React from "react";
import { QuestionFinder } from "../../app/components/pages/QuestionFinder";
import { isAda, isPhy } from "../../app/services";

it('Question finder page should have no visual regressions', () => {

    cy.mountWithStoreAndRouter(<QuestionFinder/>, ["/questions"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    if (isPhy) cy.openSidebar();
    
    // open the filters, then the stage filter
    cy.get('[data-testid=question-finder-filters]').click();
    cy.get('[data-testid=question-finder-filters]').within(() => {
        cy.get('.collapsible-head > button').first().click();
        cy.get('input[type=checkbox]').first().click();
    });

    if (isAda) cy.get('button').contains('Apply filters').click();

    if (isPhy) cy.closeSidebar();

    cy.scrollTo('top');

    cy.wait(2000);

    cy.matchImage();
});
