import {isAda, KEY} from "../../app/services";
import {Overview} from "../../app/components/pages/Overview";
import React from "react";
import { withLocalStorage } from "../../../cypress/support/utils";

it('Overview page should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        cy.mountWithStoreAndRouter(<Overview />, ["/dashboard"]);

        // Assert
        cy.matchImage();
    }
});

it.only('Teacher onboarding modal should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        const overview = withLocalStorage(
            <Overview />,
            s => s.setItem(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT, 'true')
        );
        cy.mountWithStoreAndRouter(overview, ["/dashboard"]);
        cy.get('[data-testid="active-modal"]').should('be.visible');
        // Assert
        cy.matchImage();
    }
});
