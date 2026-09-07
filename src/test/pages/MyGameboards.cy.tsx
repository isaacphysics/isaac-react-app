import React from "react";
import {mockUser} from "../../mocks/data";
import {isPhy, PATHS} from "../../app/services";
import {MyGameboards} from "../../app/components/pages/MyGameboards";

describe("My Gameboards", () => {
    it('should have no visual regressions in table view', () => {
        cy.mountWithStoreAndRouter(<MyGameboards user={mockUser} />, [PATHS.MY_GAMEBOARDS], PATHS.MY_GAMEBOARDS, mockUser);
        if (isPhy) cy.openSidebar();
        cy.get('[data-testid="display-select"]').select("Table View");
        if (isPhy) cy.closeSidebar();
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });
    it('should have no visual regressions in card view', () => {
        cy.log("step 1");
        cy.mountWithStoreAndRouter(<MyGameboards user={mockUser} />, [PATHS.MY_GAMEBOARDS], PATHS.MY_GAMEBOARDS, mockUser);
        cy.log("step 2");
        if (isPhy) cy.openSidebar();
        cy.log("step 3");
        cy.get('[data-testid="display-select"]').select("Card View");
        cy.log("step 4");
        cy.get('[data-testid="limit-select"]').should('be.visible').select("6");
        cy.log("step 5");
        if (isPhy) cy.closeSidebar();
        cy.log("step 6");
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.log("step 7");
        cy.matchImage();
    });
});
