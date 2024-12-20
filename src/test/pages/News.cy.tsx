import React from "react";
import { News } from "../../app/components/pages/News";

it('News page should have no visual regressions', () => {

    cy.mountWithStoreAndRouter(<News/>, ["/news"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    cy.matchImage();
});
