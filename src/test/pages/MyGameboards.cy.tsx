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
        console.log("step 1");
        cy.mountWithStoreAndRouter(<MyGameboards user={mockUser} />, [PATHS.MY_GAMEBOARDS], PATHS.MY_GAMEBOARDS, mockUser);
        console.log("step 2");
        if (isPhy) cy.openSidebar();
        console.log("step 3");
        cy.get('[data-testid="display-select"]').select("Card View");
        console.log("step 4");
        cy.get('[data-testid="limit-select"]').should('be.visible').select("6");
        console.log("step 5");
        if (isPhy) cy.closeSidebar();
        console.log("step 6");
        cy.get('[data-testid="loading"]').should('not.exist');
        console.log("step 7");
        cy.matchImage();
    });
});
