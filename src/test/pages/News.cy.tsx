import React from "react";
import { API_PATH, siteSpecific } from "../../app/services";
import { News } from "../../app/components/pages/News";

it('News page should have no visual regressions', () => {
    cy.intercept(
        {
            method: "GET",
            url: API_PATH + `/pages/pods/${siteSpecific("physics", "news")}/0`,
        }, 
        {}
    ).as("getNews");

    cy.mountWithStoreAndRouter(<News/>, ["/news"]);

    cy.get('[data-testid="loading"]').should('not.exist');

    cy.matchImage();
});
