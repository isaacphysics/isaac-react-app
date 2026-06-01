import React from "react";
import { Question } from "../../app/components/pages/Question";
import { mockRegressionTestQuestionParts } from "../../mocks/data";

it.skip('Question types\' regression test page (part 1) should have no visual regressions', () => {

    // the API request for the question is mocked in src/mocks/handlers.ts

    cy.mountWithStoreAndRouter(<Question questionIdOverride="_regression_test_1_"/>, ["/questions/_regression_test_1_"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    // open all accordions (that weren't already open)
    cy.get('.isaac-accordion > button.accordion-header:not(.active)').each(($el) => {
        cy.wrap($el).scrollIntoView();
        cy.wrap($el).click({scrollBehavior: false});
    });

    cy.matchImage();
});

for (const part of mockRegressionTestQuestionParts) {

    const type = part.children?.[0]?.type ?? "unknown";

    it(`Question type ${type} should have no visual regression`, () => {
        cy.mountWithStoreAndRouter(<Question questionIdOverride={part.id}/>, [`/questions/${part.id}`]);

        cy.get('[data-testid="loading"]').should('not.exist');

        cy.wait(500);

        cy.matchImage();
    });
}
