import React from "react";
import { PageFragment } from "../PageFragment";
import { Button } from "reactstrap";
import { closeActiveModal, store } from "../../../state";

export const ConfirmAccountDeletionRequestModal = (confirmAccountDeletionRequest: () => void) => {
    return {
        title: "Delete Account",
        body: <PageFragment fragmentId="account_deletion_email_confirmation_notice" />,
        buttons: [
            <Button key={0} block color="primary" onClick={() => {confirmAccountDeletionRequest();}}>
                Confirm via email
            </Button>,
            <Button key={1} block color="tertiary" onClick={() => {store.dispatch(closeActiveModal());}}>
                Cancel
            </Button>,
        ]
    };
};
