import React from "react";

import { persistence, KEY, ACTION_TYPE } from "../../app/services";
import { ActiveModals } from "../../app/components/elements/modals/ActiveModals";
import {store} from "../../app/state";

it('LogInOrSignUpModal should have no visual regressions', () => {
    // Arrange
    cy.stub(persistence.session, 'load').withArgs(KEY.FIRST_ANON_QUESTION).returns("some_question_id");

    // Act
    cy.mountWithStoreAndRouter(<div style={{height: "1200px"}}><ActiveModals /></div>, ["/"]);
    store.dispatch({ type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST });
            
    // Assert
    cy.get('body').invoke('css', 'transform', 'scale(1)');
    cy.get('[data-testid="active-modal"]').matchImage();
});
