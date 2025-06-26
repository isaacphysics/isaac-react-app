import React from "react";
import {Button} from "reactstrap";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import {siteSpecific} from "../../services";

// Button prompting the user to sign in via Microsoft
export const MicrosoftSignInButton = () => {
    const dispatch = useAppDispatch();

    const logInWithMicrosoft = () => {
        dispatch(handleProviderLoginRedirect("MICROSOFT"));
    };

    return <Button color="keyline" onClick={logInWithMicrosoft}>
        <img className="google-button-logo" src={"/assets/common/logos/microsoft-logo.svg"} alt={"Microsoft logo"}/>Microsoft
    </Button>;
};
