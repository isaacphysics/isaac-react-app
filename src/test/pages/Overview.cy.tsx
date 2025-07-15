import {isAda} from "../../app/services";
import {Overview} from "../../app/components/pages/Overview";
import React from "react";

it('Overview page should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        // @ts-ignore
        cy.mountWithStoreAndRouter(<Overview />, ["/dashboard"]);

        // Assert
        cy.matchImage();
    }
});