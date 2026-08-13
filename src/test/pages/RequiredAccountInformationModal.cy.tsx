import React from "react";

import { ACTION_TYPE } from "../../app/services";
import { ActiveModals } from "../../app/components/elements/modals/ActiveModals";
import {store} from "../../app/state";
import { mockUser as originalMockUser, mockUserPreferences } from "../../mocks/data";

it("RequiredAccountInformationModal should have no visual regressions", () => {
    // Arrange
    const mockUser = {...originalMockUser} as any;
    delete mockUser.countryCode;
    delete mockUser.schoolOther;
    mockUser.registeredContexts = [{ stage: 'invalid' }];
    delete mockUser.registeredContextsLastConfirmed;

    // Act
    cy.mountWithStoreAndRouter(<div style={{height: "800px"}}><ActiveModals /></div>, ["/"], undefined, mockUser);
    store.dispatch({type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS, userPreferences: mockUserPreferences});

    // Assert
    cy.get('body').invoke('css', 'transform', 'scale(1)');
    cy.get('[data-testid="active-modal"]').matchImage();
});
