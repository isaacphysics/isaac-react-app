import React from "react";
import {mockUser} from "../../mocks/data";
import { MyAccount } from "../../app/components/pages/MyAccount";
import { ACCOUNT_TAB, ACCOUNT_TABS, isAda } from "../../app/services";

describe("My Account", () => {
    // TODO: Remove filter if/when we release dark mode beyond SCI_DARK_MODE
    for (const tab of ACCOUNT_TABS.filter(tab => !(tab.tab === ACCOUNT_TAB.theme))) {
        if (!tab.hidden) {
            it(`should have no visual regressions on ${tab.title} page`, () => {
                cy.mountWithStoreAndRouter(<MyAccount user={mockUser}/>, ["/account"]);
                cy.get('[data-testid="loading"]').should('not.exist');
                if (isAda) {
                    cy.get('[data-testid="account-nav"]').contains(tab.title).click();
                }
                else {
                    cy.openSidebar();
                    cy.getComponent("sidebar").contains(tab.title).click();
                    // sidebar closes automatically on click
                }

                cy.matchImage();
            });
        }
    }
});
