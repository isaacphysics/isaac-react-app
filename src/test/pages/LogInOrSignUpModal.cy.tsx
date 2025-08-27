import { ActiveModal } from "../../app/components/elements/modals/ActiveModal";
import React from "react";
import { loginOrSignUpModal } from "../../app/components/elements/modals/LoginOrSignUpModal";

it('Log In or Sign Up Modal should have no visual regressions', () => {
    // Arrange
    cy.viewport(500, 1500);
    const modal = loginOrSignUpModal;
    cy.mountWithStoreAndRouter(<ActiveModal activeModal={modal}/>, ["/"]);
    cy.get('[data-testid="active-modal"]').should('be.visible');
        
    // Assert
    cy.matchImage();
});
