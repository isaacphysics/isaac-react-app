import React from "react";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import { Spacer } from "./Spacer";

// Button prompting the user to sign in via Microsoft
export const MicrosoftSignInButton = () => {
    const dispatch = useAppDispatch();

    const logInWithMicrosoft = () => dispatch(handleProviderLoginRedirect("MICROSOFT"));

    return <button className="d-flex w-100 align-items-center linked-account-button-outer bg-white mb-1 p-3" onClick={logInWithMicrosoft}>
        <img className="authenticator-logo" src={"/assets/common/logos/microsoft-logo.svg"} alt={"Microsoft logo"}/>
        Microsoft
        <Spacer />
        <i className="icon icon-chevron-right" color="primary" />
    </button>;
};
