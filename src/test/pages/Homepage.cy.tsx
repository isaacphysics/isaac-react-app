import React from "react";
import {MyAssignments} from "../../app/components/pages/MyAssignments";
import {mockUser} from "../../mocks/data";
import {isAda, PATHS} from "../../app/services";
import {HomepageCS} from "../../app/components/site/cs/HomepageCS";
import {HomepagePhy} from "../../app/components/site/phy/HomepagePhy";


it('Homepage should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        // @ts-ignore
        cy.mountWithStoreAndRouter(<HomepageCS />, ["/"]);

        // Act
        // confirm page has loaded
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.get('[data-testid="news-pod"]').should('exist');

        // Assert
        cy.matchImage();
    } else {
        // Arrange
        // @ts-ignore
        cy.mountWithStoreAndRouter(<HomepagePhy />, ["/"]);

        // Act
        // confirm page has loaded
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.get('[data-testid="news-pod"]').should('exist');
        cy.get('[data-testid="yt-thumbnail"]').should('exist');

        // Assert
        cy.matchImage();
    }
});