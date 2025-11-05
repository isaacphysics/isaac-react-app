import React from "react";
import { PageFragment } from "../PageFragment";
import { Button } from "reactstrap";
import { closeActiveModal, store } from "../../../state";
import { siteSpecific } from "../../../services";

export const ConfirmAccountDeletionRequestModal = (confirmAccountDeletionRequest: () => void) => {
    return {
        title: siteSpecific("Delete Account", "Delete account"),
        body: <PageFragment fragmentId="account_deletion_email_confirmation_notice" />,
        buttons: [
            <Button key={1} block color="keyline" onClick={() => {store.dispatch(closeActiveModal());}}>
                Cancel
            </Button>,
            <Button key={0} block color="solid" onClick={() => {confirmAccountDeletionRequest();}}>
                Confirm via email
            </Button>,
        ]
    };
};
