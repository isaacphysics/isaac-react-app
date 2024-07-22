import React from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {AppState, useAppSelector} from "../../../state";
import {SITE_TITLE, siteSpecific, validateEmailPreferences} from "../../../services";
import {UserEmailPreferencesInput} from "../inputs/UserEmailPreferencesInput";
import { MyAccountTab } from "./MyAccountTab";
import {ExigentAlert} from "../ExigentAlert";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null | undefined;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
}
export const UserEmailPreferencesPanel = ({emailPreferences, setEmailPreferences, submissionAttempted, idPrefix="my-account-"}: UserEmailPreferencesProps) => {
    const error = useAppSelector((state: AppState) => state && state.error);

    let errorMessage = null;
    if (error && error.type === "generalError") {
        errorMessage = error.generalError;
    } else  if (submissionAttempted && !validateEmailPreferences(emailPreferences)) {
        errorMessage = "Please specify all email preferences";
    }

    return <>
        {error?.type == "generalError" &&
            <ExigentAlert color="warning">
                <p className="alert-heading fw-bold">Unable to update your account</p>
                <p>{error.generalError}</p>
            </ExigentAlert>
        }
        <MyAccountTab
            leftColumn={<>
                <h3>Set your email notification preferences</h3>
                <p>Get important information about the {SITE_TITLE} programme delivered to your inbox. These settings can be changed at any time.</p>
                <b>Frequency</b>: expect one email per term for News{siteSpecific(" and a monthly bulletin for Events", "")}. Assignment notifications will be sent as needed by your teacher.
            </>}
            rightColumn={
                <UserEmailPreferencesInput emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences} submissionAttempted={submissionAttempted} idPrefix={idPrefix}
            />}
        />
    </>;
};
