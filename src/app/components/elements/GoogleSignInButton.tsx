import React from "react";
import {Button} from "reactstrap";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";

// Button prompting the user to sign in via Google
export const GoogleSignInButton = () => {
    const dispatch = useAppDispatch();

    const logInWithGoogle = () => {
        dispatch(handleProviderLoginRedirect("GOOGLE"));
    };

    return <Button className={"position-relative"} block outline color="primary" onClick={logInWithGoogle}>
        <img className="google-button-logo" src={"/assets/google-logo.svg"} alt={"Google logo"}/>Google
    </Button>
}