import { ActiveModal } from "../../app/components/elements/modals/ActiveModal";
import { adaTeacherOnboardingModal } from "../../app/components/elements/modals/AdaTeacherOnboardingModal";
import { isAda } from "../../app/services";
import React from "react";

it('Teacher Onboarding Modal should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        const modal = adaTeacherOnboardingModal;
        cy.mountWithStoreAndRouter(<ActiveModal key={modal.title} activeModal={modal}/>, ["/dashboard"]);
        cy.get('[data-testid="active-modal"]').should('be.visible');
        
        // Assert
        cy.matchImage();
    }
});
