import React from "react";

import { ACTION_TYPE, STAGE } from "../../app/services";
import { ActiveModals } from "../../app/components/elements/modals/ActiveModals";
import {store} from "../../app/state";
import { mockUser as originalMockUser, mockUserPreferences } from "../../mocks/data";
import { LoggedInUser } from "../../IsaacAppTypes";

it("RequiredAccountInformationModal should have no visual regressions", () => {
    // Arrange
    const mockUser: LoggedInUser = {...originalMockUser};
    delete mockUser.countryCode;
    delete mockUser.schoolOther;
    mockUser.registeredContexts = [{ stage: STAGE.SCOTLAND_HIGHER }];
    delete mockUser.registeredContextsLastConfirmed;

    // Act
    cy.mountWithStoreAndRouter(<div style={{height: "800px"}}><ActiveModals /></div>, ["/"], undefined, mockUser);
    store.dispatch({type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS, userPreferences: mockUserPreferences});

    // Assert
    cy.matchModal();
});
