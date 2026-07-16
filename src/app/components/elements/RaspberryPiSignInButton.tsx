import React from "react";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import { Spacer } from "./Spacer";

export const RaspberryPiSignInButton = ({isSignup, concise}: {isSignup?: boolean, concise?: boolean}) => {
    const dispatch = useAppDispatch();

    const logInWithRaspberryPi = () => dispatch(handleProviderLoginRedirect("RASPBERRYPI", isSignup));

    return <button className="d-flex w-100 align-items-center linked-account-button-outer bg-white mb-1 p-3" onClick={logInWithRaspberryPi}>
        <img className="authenticator-logo" src={"/assets/common/logos/raspberry-pi.png"} alt={"Raspberry Pi logo"}/>
        {
            concise ?
                <div className={"d-inline"}>Raspberry Pi</div> :
                <div className={"d-inline"}>
                    <div className={"d-inline d-md-none"}>Raspberry Pi</div>
                    <div className={"d-none d-md-inline"}>Raspberry Pi Foundation</div>
                </div>
        }
        <Spacer />
        <i className="icon icon-chevron-right" color="primary" />
    </button>;
};
