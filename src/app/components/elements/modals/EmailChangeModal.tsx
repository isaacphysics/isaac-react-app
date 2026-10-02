import {AppDispatch, closeActiveModal, openActiveModal} from "../../../state";
import {Button} from "reactstrap";
import React from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

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
            title: i18next.t("common:account.emailChange.title"),
            body: <EmailChangeModal proceed={proceed} cancel={cancel} />
        }));
    });
}

export const EmailChangeModal = (props: EmailChangeModalProps) => {
    const { t } = useTranslation();
    const {proceed, cancel} = props;

    return <div>
        <p>
            {t("common:account.emailChange.explanation")}
        </p>
        <p> {t("common:account.emailChange.confirmQuestion")} </p>
        <div className="w-100">
            <Button
                className={"float-start mb-4"}
                color={"keyline"}
                onClick={cancel}
            >
                {t("common:account.emailChange.cancelButton")}
            </Button>
            <Button
                className={"float-end mb-4"}
                color={"solid"}
                onClick={proceed}
            >
                {t("common:account.emailChange.okButton")}
            </Button>
        </div>
    </div>;
};