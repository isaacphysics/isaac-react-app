import {mockUser} from "../../mocks/data";
import React from "react";
import GameboardBuilder from "../../app/components/pages/GameboardBuilder";
import { ActiveModals } from "../../app/components/elements/modals/ActiveModals";

it('Gameboard builder should have no visual regressions', () => {
    // @ts-ignore
    cy.mountWithStoreAndRouter(<>
        <ActiveModals/>
        <GameboardBuilder user={mockUser}/>
    </>);

    cy.get('[data-testid="loading"]').should('not.exist');

    cy.get('button').contains('Add questions').click();

    cy.get('.modal-content').within(() => {
        cy.get('input[id=question-search-stage]').first().type('GCSE');

        cy.get('table').within(() => {
            for (let i = 0; i < 5; i++) {
                cy.get('input[type=checkbox]').eq(i).click();
            }
        });

        cy.get('[data-testid=add-selections-button]').click();
    });

    // Make screen wide enough to include reorder and bin buttons
    cy.viewport(576, 1000);
    cy.scrollTo('top');
    
    cy.matchImage();
});
