import React from "react";
import { Concept } from "../../app/components/pages/Concept";
import { isAda } from "../../app/services";

it('Concept pages should have no visual regressions', () => {

    // @ts-ignore
    cy.mountWithStoreAndRouter(<Concept conceptIdOverride="_mock_concept_page_"/>, ["/concepts/_mock_concept_page_"]);

    if (isAda) {
        cy.get('select[id="uc-exam-board-select"]').select('All Exam Boards');
    }

    cy.get('[data-testid="loading"]').should('not.exist');

    // open accordion
    cy.get('.isaac-accordion > button.accordion-header:not(.active)').scrollIntoView();
    cy.get('.isaac-accordion > button.accordion-header:not(.active)').click();

    cy.scrollTo('top');

    cy.matchImage();
});
