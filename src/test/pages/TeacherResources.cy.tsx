import {isAda} from "../../app/services";
import React from "react";
import { TeacherResources } from "../../app/components/pages/TeacherResources";

it('Teacher Resources page should have no visual regressions', () => {
    if (isAda) {
        // Arrange
        cy.mountWithStoreAndRouter(<TeacherResources />, ["/teachers"]);

        // Assert
        cy.matchImage();
    }
});
