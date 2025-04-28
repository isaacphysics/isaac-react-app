import {mockUser} from "../../mocks/data";
import React from "react";
import GameboardBuilder from "../../app/components/pages/GameboardBuilder";

it('Gameboard builder should have no visual regressions', () => {
    // @ts-ignore
    cy.mountWithStoreAndRouter(<GameboardBuilder user={mockUser}/>);
    cy.wait(500);
    cy.matchImage();
});