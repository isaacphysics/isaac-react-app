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

    return <Button className={"position-relative"} block outline color={siteSpecific("primary", undefined)} style={siteSpecific({}, {borderColor: "black"})} onClick={logInWithGoogle}>
        <img className="google-button-logo" src={"/assets/google-logo.svg"} alt={"Google logo"}/>Google
    </Button>;
}
