import React from "react";
import { Search } from "../../app/components/pages/Search";

it('Search results should have no visual regressions', () => {
    cy.mountWithStoreAndRouter(<Search/>, ["/search"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    cy.get('[type=search]').type('test{enter}');

    cy.matchImage();
});
