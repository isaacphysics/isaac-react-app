import React from "react";
import { LogIn } from "../../app/components/pages/LogIn";

it('Log In page should have no visual regressions', () => {
    // Arrange
    cy.mountWithStoreAndRouter(<LogIn />, ["/login"]);
        
    // Assert
    cy.matchImage();
});
