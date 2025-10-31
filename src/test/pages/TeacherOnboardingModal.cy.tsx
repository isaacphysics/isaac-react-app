import { AdaTeacherOnboardingModal } from "../../app/components/elements/modals/AdaTeacherOnboardingModal";
import { isAda } from "../../app/services";
import React from "react";

it('Teacher Onboarding Modal should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        cy.mountWithStoreAndRouter(<AdaTeacherOnboardingModal/>, ["/dashboard"]);
        cy.get('[data-testid="active-modal"]').should('be.visible');
        
        // Assert
        cy.matchImage();
    }
});
