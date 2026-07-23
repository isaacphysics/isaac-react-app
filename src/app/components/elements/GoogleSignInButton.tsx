import React from "react";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import {siteSpecific} from "../../services";
import { Spacer } from "./Spacer";
import { UserRole } from "../../../IsaacApiTypes";

// Button prompting the user to sign in via Google
export const GoogleSignInButton = ({isSignup, knownRole}: {isSignup?: boolean, knownRole?: UserRole}) => {
    const dispatch = useAppDispatch();

    const logInWithGoogle = () => dispatch(handleProviderLoginRedirect("GOOGLE", isSignup, knownRole));

    return <button className="d-flex w-100 align-items-center linked-account-button-outer bg-white mb-1 p-3" onClick={logInWithGoogle}>
        <img className="authenticator-logo" src={"/assets/common/logos/google-logo.svg"} height={siteSpecific("20px", "auto")} alt={"Google logo"}/>
        Google
        <Spacer />
        <i className="icon icon-chevron-right" color="primary" />
    </button>;
};

