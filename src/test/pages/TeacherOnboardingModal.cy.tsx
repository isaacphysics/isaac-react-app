import { ActiveModals } from "../../app/components/elements/modals/ActiveModals";
import { Overview } from "../../app/components/pages/Overview";
import { isAda, KEY, persistence } from "../../app/services";
import React from "react";

describe('Overview Page Visual Regression Tests', () => {    
    it('Teacher Onboarding Modal should have no visual regressions', () => {
        if (isAda) {
            // Arrange
            cy.stub(persistence, 'load').withArgs(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT).returns("true");

            // Act
            cy.mountWithStoreAndRouter(<>
                <ActiveModals/>
                <Overview />
            </>, ["/dashboard"]);
            cy.get('[data-testid="active-modal"]').should('be.visible');

            // make screen large enough that modal does not need to scroll
            // https://github.com/cypress-io/cypress/issues/19438#issuecomment-1508248270
            cy.viewport(1280, 720); 
            
            // Assert
            cy.get('[data-testid="active-modal"]').matchImage();
        }
    });
});
