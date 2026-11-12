import React from "react";
import {handleProviderLoginRedirect, useAppDispatch} from "../../state";
import { Spacer } from "./Spacer";
import { UserRole } from "../../../IsaacApiTypes";
import { useTranslation } from "react-i18next";

// Button prompting the user to sign in via Microsoft
export const MicrosoftSignInButton = ({isSignup, knownRole}: {isSignup?: boolean, knownRole?: UserRole}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const logInWithMicrosoft = () => dispatch(handleProviderLoginRedirect("MICROSOFT", isSignup, knownRole));

    return <button className="d-flex w-100 align-items-center linked-account-button-outer bg-white mb-1 p-3" onClick={logInWithMicrosoft}>
        <img className="authenticator-logo" src={"/assets/common/logos/microsoft-logo.svg"} alt={t("common:auth.microsoft.logoAlt")}/>
        {t("common:auth.microsoft.buttonLabel")}
        <Spacer />
        <i className="icon icon-chevron-right" color="primary" />
    </button>;
};
