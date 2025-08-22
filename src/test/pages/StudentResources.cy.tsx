import {isAda} from "../../app/services";
import React from "react";
import { StudentResources } from "../../app/components/pages/StudentResources";

it('Student Resources page should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        cy.mountWithStoreAndRouter(<StudentResources />, ["/students"]);

        // Assert
        cy.matchImage();
    }
});
