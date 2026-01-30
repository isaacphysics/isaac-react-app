import React from "react";
import {mockUser} from "../../mocks/data";
import {isPhy, PATHS} from "../../app/services";
import {MyGameboards} from "../../app/components/pages/MyGameboards";

describe("My Gameboards", () => {
    it('should have no visual regressions in table view', () => {
        cy.mountWithStoreAndRouter(<MyGameboards user={mockUser} />, [PATHS.MY_GAMEBOARDS]);
        if (isPhy) cy.openSidebar();
        cy.get('[data-testid="display-select"]').select("Table View");
        if (isPhy) cy.closeSidebar();
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });
    it('should have no visual regressions in card view', () => {
        cy.mountWithStoreAndRouter(<MyGameboards user={mockUser} />, [PATHS.MY_GAMEBOARDS]);
        if (isPhy) cy.openSidebar();
        cy.get('[data-testid="display-select"]').select("Card View");
        cy.get('[data-testid="limit-select"]').select("6");
        if (isPhy) cy.closeSidebar();
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });
});
