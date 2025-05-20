import React from "react";
import {Button} from "reactstrap";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import {isAda, siteSpecific} from "../../services";

// Button prompting the user to sign in via Google
export const GoogleSignInButton = () => {
    const dispatch = useAppDispatch();

    const logInWithGoogle = () => {
        dispatch(handleProviderLoginRedirect("GOOGLE"));
    };

    return <Button className={"position-relative"} block outline={isAda} color={siteSpecific("keyline", undefined)} style={siteSpecific({borderWidth: "1px"}, {borderColor: "black", color: "black"})} onClick={logInWithGoogle}>
        <img className="google-button-logo" src={"/assets/common/logos/google-logo.svg"} height={siteSpecific("20px", "auto")} alt={"Google logo"}/>Google
    </Button>;
};
