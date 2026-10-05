import React from "react";
import {Button} from "reactstrap";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import { siteSpecific } from "../../services";
import { useTranslation } from "react-i18next";

// Button prompting the user to sign in via Microsoft
export const MicrosoftSignInButton = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const logInWithMicrosoft = () => dispatch(handleProviderLoginRedirect("MICROSOFT"));

    return <Button color={siteSpecific("keyline-underline", "keyline")} className="w-100" onClick={logInWithMicrosoft}>
        <img className="authenticator-logo" src={"/assets/common/logos/microsoft-logo.svg"} alt={t("common:auth.microsoft.logoAlt")}/>
        {t("common:auth.microsoft.buttonLabel")}
    </Button>;
};
