import {isAda} from "../../app/services";
import {TeacherOverview} from "../../app/components/pages/Overview";
import React from "react";

it('Teacher overview page should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        cy.mountWithStoreAndRouter(<TeacherOverview />, ["/dashboard"]);

        // Assert
        cy.matchImage();
    }
});
