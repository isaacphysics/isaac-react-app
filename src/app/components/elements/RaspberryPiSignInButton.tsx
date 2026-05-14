import React from "react";
import {Button} from "reactstrap";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import { useTranslation } from 'react-i18next'

export const RaspberryPiSignInButton = ({isSignup, concise}: {isSignup?: boolean, concise?: boolean}) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();

    const logInWithRaspberryPi = () => dispatch(handleProviderLoginRedirect("RASPBERRYPI", isSignup));

    return <Button color="keyline" className="w-100" onClick={logInWithRaspberryPi}>
        <img className="authenticator-logo" src={"/assets/common/logos/raspberry-pi.png"} alt={t('raspberryPiLogo', 'Raspberry Pi logo')}/>
        {
            concise ?
                <div className={"d-inline"}>{t('raspberryPi', 'Raspberry Pi')}</div> :
                <div className={"d-inline"}>
                    <div className={"d-inline d-md-none"}>{t('raspberryPi', 'Raspberry Pi')}</div>
                    <div className={"d-none d-md-inline"}>{t('raspberryPiFoundation', 'Raspberry Pi Foundation')}</div>
                </div>
        }
    </Button>;
};
