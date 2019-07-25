import {store} from "../../state/store";
import {closeActiveModal, updateCurrentUser} from "../../state/actions";
import React, {useState} from "react";
import * as RS from "reactstrap";
import {UserEmailPreference} from "./UserEmailPreferences";
import {UserEmailPreferences, UserPreferencesDTO} from "../../../IsaacAppTypes";

export const userPreferencesModal = (userPreferences: UserPreferencesDTO | null) => {
    const user = store.getState().user;

    // ModalScopedEmailPreferences allow the sharing of the values between the body and the buttons
    const modalScopedEmailPreferences = (userPreferences && userPreferences.EMAIL_PREFERENCE) ? userPreferences.EMAIL_PREFERENCE : {};

    const UserPreferencesModalBody = () => {
        // Need to use state here so that <UserEmailPreferences ... /> re-renders on emailPreference change
        const [emailPreferences, setEmailPreferences] = useState<UserEmailPreferences>(modalScopedEmailPreferences);
        function updateEmailPreferencesInModalScope(newEmailPreferences: UserEmailPreferences) {
            Object.assign(modalScopedEmailPreferences, newEmailPreferences);
            setEmailPreferences(newEmailPreferences);
        }

        return <UserEmailPreference
            emailPreferences={emailPreferences}
            setEmailPreferences={updateEmailPreferencesInModalScope}
            idPrefix="modal-"
        />
    };

    return {
        title: "Required account information",
        body: <UserPreferencesModalBody />,
        closeAction: () => store.dispatch(closeActiveModal()),
        buttons: [
            <RS.Button key={0} color="primary" outline onClick={() => store.dispatch(closeActiveModal())}>
                Ignore for now
            </RS.Button>,
            <RS.Button key={1} color="secondary" onClick={() => {
                store.dispatch(updateCurrentUser(user, {EMAIL_PREFERENCE: modalScopedEmailPreferences},null, user));
                store.dispatch(closeActiveModal())
            }}>
                Update account
            </RS.Button>,
        ]
    }
};
