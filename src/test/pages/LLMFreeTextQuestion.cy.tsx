import React from "react";
import { Question } from "../../app/components/pages/Question";

it('LLM-marked question page should have no visual regressions', () => {
    // the API request for the question and response is mocked in src/mocks/handlers.ts

    cy.mountWithStoreAndRouter(<Question questionIdOverride="_llm_marked_regression_test_"/>, ["/questions/_llm_marked_regression_test_"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    cy.get('textarea').type('Hello world');
    cy.get('input').contains('Check my answer').click();

    cy.scrollTo('top');

    cy.matchImage();
});
