import React from "react";
import { HeaderCS } from "../../app/components/site/cs/HeaderCS";
import { HeaderPhy } from "../../app/components/site/phy/HeaderPhy";
import { isAda } from "../../app/services";

it('Navigation menu should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        cy.mountWithStoreAndRouter(<HeaderCS/>, ["/"]);
        
        cy.wait(1000);

        // Act
        cy.get('button.navbar-toggler[aria-label="Toggle navigation"]').click();
        // click on the second menu item
        cy.get('button.navbar-toggler[aria-label="Toggle navigation"] ~ div.navbar-collapse > ul > li').eq(1).click();
        cy.scrollTo('top');

        cy.wait(1000);

        // Assert
        cy.matchImage();
    } else {
        // Arrange
        cy.mountWithStoreAndRouter(<HeaderPhy/>, ["/"]);

        cy.wait(1000);

        // Act
        cy.get('button.navbar-toggler[aria-label="Open menu"]').click();
        // click on the second menu item
        cy.get('button.navbar-toggler[aria-label="Close menu"] ~ div.navbar-collapse > ul > li').eq(1).click();
        cy.scrollTo('top');

        cy.wait(1000);

        // Assert
        cy.matchImage();
    }
});
