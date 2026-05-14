import React from "react";
import { PageFragment } from "../PageFragment";
import { Button } from "reactstrap";
import { closeActiveModal, store } from "../../../state";
import { siteSpecific } from "../../../services";
import { useTranslation } from 'react-i18next'

export const ConfirmAccountDeletionRequestModal = (confirmAccountDeletionRequest: () => void) => {
    const { t } = useTranslation()
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: siteSpecific(t('deleteAccount', 'Delete Account'), "Delete account"),
        body: <PageFragment fragmentId="account_deletion_email_confirmation_notice" />,
        buttons: [
            <Button key={1} block color="keyline" onClick={() => {store.dispatch(closeActiveModal());}}>
                {t('cancel', 'Cancel')}
            </Button>,
            <Button key={0} block color="solid" onClick={() => {confirmAccountDeletionRequest();}}>
                {t('confirmViaEmail', 'Confirm via email')}
            </Button>,
        ]
    };
};
