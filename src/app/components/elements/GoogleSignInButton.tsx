import React from "react";
import {Button} from "reactstrap";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import {siteSpecific} from "../../services";

// Button prompting the user to sign in via Google
export const GoogleSignInButton = () => {
    const dispatch = useAppDispatch();

    const logInWithGoogle = () => {
        dispatch(handleProviderLoginRedirect("GOOGLE"));
    };

    return <Button color={siteSpecific("keyline-underline", "keyline")} className="w-100" onClick={logInWithGoogle}>
        <img className="authenticator-logo" src={"/assets/common/logos/google-logo.svg"} height={siteSpecific("20px", "auto")} alt={"Google logo"}/>
        Google
    </Button>;
};

