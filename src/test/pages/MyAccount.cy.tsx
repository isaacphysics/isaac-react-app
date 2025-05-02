import React from "react";
import {mockUser} from "../../mocks/data";
import { MyAccount } from "../../app/components/pages/MyAccount";
import { ACCOUNT_TABS, isAda } from "../../app/services";

describe("My Account", () => {
    for (const tab of ACCOUNT_TABS) {
        if (!tab.hidden) {
            it(`should have no visual regressions on ${tab.title} page`, () => {
                cy.mountWithStoreAndRouter(<MyAccount user={mockUser}/>, ["/account"]);
                cy.get('[data-testid="loading"]').should('not.exist');
                if (isAda) {
                    cy.get('[data-testid="account-nav"]').contains(tab.title).click();
                }
                else {
                    cy.get('[data-testid="sidebar-toggle"]').click();
                    cy.get('#content-sidebar-offcanvas').contains(tab.title).click();
                }
                cy.wait(500);
                
                cy.matchImage();
            });
        }
    }
});
