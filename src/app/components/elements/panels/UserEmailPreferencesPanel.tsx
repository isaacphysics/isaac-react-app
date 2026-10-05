import React from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {AppState, useAppSelector} from "../../../state";
import {SITE_TITLE, validateEmailPreferences} from "../../../services";
import {UserEmailPreferencesInput} from "../inputs/UserEmailPreferencesInput";
import { MyAccountTab } from "./MyAccountTab";
import {ExigentAlert} from "../ExigentAlert";
import { Trans, useTranslation } from "react-i18next";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null | undefined;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
}
export const UserEmailPreferencesPanel = ({emailPreferences, setEmailPreferences, submissionAttempted, idPrefix="my-account-"}: UserEmailPreferencesProps) => {
    const { t } = useTranslation();
    const error = useAppSelector((state: AppState) => state && state.error);

    let errorMessage = null;
    if (error && error.type === "generalError") {
        errorMessage = error.generalError;
    } else  if (submissionAttempted && !validateEmailPreferences(emailPreferences)) {
        errorMessage = t("common:account.emailPreferences.validationError");
    }

    return <>
        {error?.type == "generalError" &&
            <ExigentAlert color="warning">
                <p className="alert-heading fw-bold">{t("common:account.updateError.alertTitle")}</p>
                <p>{error.generalError}</p>
            </ExigentAlert>
        }
        <MyAccountTab
            leftColumn={<>
                <h3>{t("common:account.emailPreferences.title")}</h3>
                <p>{t("common:account.emailPreferences.description", { siteTitle: SITE_TITLE })}</p>
                <Trans i18nKey="site:account.emailPreferences.frequencyNote" components={{ strong: <b /> }} />
            </>}
            rightColumn={
                <UserEmailPreferencesInput emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences} submissionAttempted={submissionAttempted} idPrefix={idPrefix}/>
            }
        />
    </>;
};
