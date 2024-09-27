import React from "react";
import {mockUser} from "../../mocks/data";
import {PATHS} from "../../app/services";
import {MyGameboards} from "../../app/components/pages/MyGameboards";

describe("My Gameboards", () => {
    it('should have no visual regressions in table view', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<MyGameboards user={mockUser}/>, [PATHS.MY_GAMEBOARDS]);
        cy.get('[data-testid="display-select"]').select("Table View");
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.wait(1000); // todo: work out why the loading spinner still shows up and remove this
        cy.matchImage();
    });
    it('should have no visual regressions in card view', () => {
        // @ts-ignore
        cy.mountWithStoreAndRouter(<MyGameboards user={mockUser}/>, [PATHS.MY_GAMEBOARDS]);
        cy.get('[data-testid="display-select"]').select("Card View");
        cy.get('[data-testid="loading"]').should('not.exist');
        cy.matchImage();
    });
});
