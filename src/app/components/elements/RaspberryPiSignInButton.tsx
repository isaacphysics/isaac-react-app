import React from "react";
import {Button} from "reactstrap";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";

export const RaspberryPiSignInButton = ({isSignup, concise}: {isSignup?: boolean, concise?: boolean}) => {
    const dispatch = useAppDispatch();

    const logInWithRaspberryPi = () => {
        dispatch(handleProviderLoginRedirect("RASPBERRYPI", isSignup));
    };

    return <Button className={"position-relative"} block outline color="primary" onClick={logInWithRaspberryPi}>
        <img className="rpf-button-logo" src={"/assets/logos/raspberry-pi.png"} alt={"Raspberry Pi logo"}/>
        {
            concise ?
                <div className={"d-inline"}>Raspberry Pi</div> :
                <div className={"d-inline"}>
                    <div className={"d-inline d-md-none"}>Raspberry Pi</div>
                    <div className={"d-none d-md-inline"}>Raspberry Pi Foundation</div>
                </div>
        }
    </Button>
}