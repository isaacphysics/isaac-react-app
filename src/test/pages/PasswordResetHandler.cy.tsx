import React from "react";
import {ResetPasswordHandler} from "../../app/components/handlers/PasswordResetHandler";

it('Password reset page should have no visual regressions', () => {
    // Arrange & Act
    cy.mountWithStoreAndRouter(<ResetPasswordHandler />, ["/resetpassword"], {pathname: "/resetpassword", search: "?token=some-token"});

    // Assert
    cy.matchImage();
});
