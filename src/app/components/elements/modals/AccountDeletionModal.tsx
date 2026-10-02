import React from "react";
import { PageFragment } from "../PageFragment";
import { Button } from "reactstrap";
import { closeActiveModal, store } from "../../../state";
import i18next from "i18next";

export const ConfirmAccountDeletionRequestModal = (confirmAccountDeletionRequest: () => void) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: i18next.t("site:account.deletion.title"),
        body: <PageFragment fragmentId="account_deletion_email_confirmation_notice" />,
        buttons: [
            <Button key={1} block color="keyline" onClick={() => {store.dispatch(closeActiveModal());}}>
                {i18next.t("common:account.deletion.cancelButton")}
            </Button>,
            <Button key={0} block color="solid" onClick={() => {confirmAccountDeletionRequest();}}>
                {i18next.t("common:account.deletion.confirmButton")}
            </Button>,
        ]
    };
};
