import { scheduleTeacherOnboardingModalForNextOverviewVisit } from "../../app/components/elements/modals/AdaTeacherOnboardingModal";
import { Overview } from "../../app/components/pages/Overview";
import { isAda } from "../../app/services";
import React from "react";

it('Teacher Onboarding Modal should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        scheduleTeacherOnboardingModalForNextOverviewVisit();
        cy.mountWithStoreAndRouter(<Overview />, ["/dashboard"]);
        cy.get('[data-testid="active-modal"]').should('be.visible');
        
        // Assert
        cy.matchImage();
    }
});
