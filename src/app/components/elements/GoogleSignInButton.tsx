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

    // This can't use btn-keyline because we don't want the keyline hover behaviour
    return <Button className={"position-relative"} block outline color={siteSpecific("primary", undefined)} style={siteSpecific({borderColor: "#545461", borderWidth: "1.5px"}, {borderColor: "black", color: "black"})} onClick={logInWithGoogle}>
        <img className="google-button-logo" src={"/assets/common/logos/google-logo.svg"} height={siteSpecific("20px", "auto")} alt={"Google logo"}/>Google
    </Button>;
};
