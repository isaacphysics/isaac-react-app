import {AppDispatch, closeActiveModal, openActiveModal} from "../../../state";
import {Button} from "reactstrap";
import React from "react";
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

type EmailChangeModalProps = {
    proceed: () => void;
    cancel: () => void;
};

export function showEmailChangeModal(dispatch: AppDispatch): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const proceed = () => {
            resolve(true);
            dispatch(closeActiveModal());
        };
        const cancel = () => {
            resolve(false);
            dispatch(closeActiveModal());
        };

        dispatch(openActiveModal({
            title: i18next.t('editingYourEmailAddress', 'Editing your email address'),
            body: <EmailChangeModal proceed={proceed} cancel={cancel} />
        }));
    });
}

export const EmailChangeModal = (props: EmailChangeModalProps) => {
    const { t } = useTranslation()
    const {proceed, cancel} = props;

    return <div>
        <p>
            {t('youHaveChangedYourAccountEmailAddressThisNewEmailAddressWon39tBeUsedUntilYouClickTheVerificationLinkSentToItUntilThenWeWillUseTheOldEmailAddressAndYouWillStillNeedToUseThatWhenLoggingInByEmailAndPassword', 'You have changed your account email address. This new email address won&#39;t be used until you click the verification link sent to it.\n            Until then, we will use the old email address and you will still need to use that when logging in by email and password.')}
        </p>
        <p> {t('wouldYouLikeToContinue', 'Would you like to continue?')} </p>
        <div className="w-100">
            <Button
                className={"float-start mb-4"}
                color={"keyline"}
                onClick={cancel}
            >
                {t('cancel', 'Cancel')}
            </Button>
            <Button
                className={"float-end mb-4"}
                color={"solid"}
                onClick={proceed}
            >
                OK
            </Button>
        </div>
    </div>;
};