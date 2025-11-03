import {AppDispatch, closeActiveModal, openActiveModal} from "../../../state";
import {Button} from "reactstrap";
import {siteSpecific} from "../../../services";
import React from "react";

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
            title: `Editing your email address`,
            body: <EmailChangeModal proceed={proceed} cancel={cancel} />
        }));
    });
}

export const EmailChangeModal = (props: EmailChangeModalProps) => {
    const {proceed, cancel} = props;

    return <div>
        <p>
            You have changed your account email address. This new email address won&#39;t be used until you click the verification link sent to it.
            Until then, we will use the old email address and you will still need to use that when logging in by email and password.
        </p>
        <p> Would you like to continue? </p>
        <div className="w-100">
            <Button
                className={"float-start mb-4"}
                color={siteSpecific("tertiary", "keyline")}
                onClick={cancel}
            >
                Cancel
            </Button>
            <Button
                className={"float-end mb-4"}
                onClick={proceed}
            >
                OK
            </Button>
        </div>
    </div>;
};