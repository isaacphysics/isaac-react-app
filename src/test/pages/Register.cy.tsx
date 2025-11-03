import React from "react";
import { RegistrationStart } from "../../app/components/pages/RegistrationStart";

it('Registration page should have no visual regressions', () => {
    // Arrange
    cy.mountWithStoreAndRouter(<RegistrationStart/>, ["/"]);
        
    // Assert
    cy.matchImage();
});
