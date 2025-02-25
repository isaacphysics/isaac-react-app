import React from "react";
import { Concept } from "../../app/components/pages/Concept";

it('Concept pages should have no visual regressions', () => {

    // @ts-ignore
    cy.mountWithStoreAndRouter(<Concept conceptIdOverride="_mock_concept_page_"/>, ["/concepts/_mock_concept_page_"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    // open accordion
    cy.get('.accordion-header > button:not(.active)').scrollIntoView();
    cy.get('.accordion-header > button:not(.active)').click();

    cy.scrollTo('top');

    cy.matchImage();
});
