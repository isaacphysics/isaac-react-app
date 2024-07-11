import React from "react";
import {mockUser} from "../../mocks/data";
import {Groups} from "../../app/components/pages/Groups";


it('Groups should have no visual regressions', () => {
    // @ts-ignore
    cy.mountWithStoreAndRouter(<Groups user={mockUser}/>);
    cy.get('[data-testid="loading"]').should('not.exist');
    cy.matchImage();
});