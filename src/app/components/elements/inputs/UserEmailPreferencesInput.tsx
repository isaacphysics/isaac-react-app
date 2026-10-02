import {StyledCheckbox} from "./StyledCheckbox";
import {FormGroup, Table} from "reactstrap";
import React, {SetStateAction, useState} from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {EMAIL_PREFERENCE_DEFAULTS, isPhy} from "../../../services";
import {Dispatch} from "react";
import { TrueFalseRadioInput } from "./TrueFalseRadioInput";
import classNames from "classnames";
import {WithLinkableSetting} from "../WithLinkableSetting";
import { useTranslation } from "react-i18next";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null | undefined;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    submissionAttempted?: boolean;
    idPrefix?: string;
}

export const UserEmailPreferencesInput = ({emailPreferences, setEmailPreferences, submissionAttempted, idPrefix="my-account-"}: UserEmailPreferencesProps) => {
    const { t } = useTranslation();
    const isaacEmailPreferenceDescriptions = {
        assignments: t("site:account.emailPreferences.assignmentsDescription"),
        news: t("site:account.emailPreferences.newsDescription"),
        events: t("site:account.emailPreferences.eventsDescription")
    };

    return <FormGroup className={classNames("form-group", {"pt-4": isPhy})}>
        {isPhy && submissionAttempted !== undefined ? <> {/* submissionAttempted should always exist on phy, just here for typing */}
            <Table className="mb-0">
                <thead>
                    <tr>
                        <th>{t("common:account.emailPreferences.typeHeader")}</th>
                        <th className="d-none d-sm-table-cell">{t("common:account.emailPreferences.descriptionHeader")}</th>
                        <th className="text-center">{t("common:account.emailPreferences.preferenceHeader")}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="form-required">{t("common:account.emailPreferences.assignmentsLabel")}</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.assignments}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}assignments`} stateObject={emailPreferences}
                                propertyName="ASSIGNMENTS" accessibleName="assignments"
                                setStateFunction={setEmailPreferences} submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="form-required">{t("common:account.emailPreferences.newsLabel")}</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.news}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}news`} stateObject={emailPreferences}
                                propertyName="NEWS_AND_UPDATES" accessibleName="news and updates"
                                setStateFunction={setEmailPreferences} submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    {<tr>
                        <td className="form-required">{t("common:account.emailPreferences.eventsLabel")}</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.events}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}events`} stateObject={emailPreferences}
                                propertyName="EVENTS" accessibleName="events"
                                setStateFunction={setEmailPreferences} submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>}
                </tbody>
            </Table>
        </> : <>
            <WithLinkableSetting className={"email-preference"} id={"assignments-preference"}>
                <StyledCheckbox checked={emailPreferences?.ASSIGNMENTS ?? false} id={`${idPrefix}assignments`}
                    onChange={(e) => setEmailPreferences({...emailPreferences, ASSIGNMENTS: e.target.checked})}
                    label={<span><b>{t("common:account.emailPreferences.assignmentsLabel")}</b></span>}
                />
                <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.assignments}</span>
            </WithLinkableSetting>

            <WithLinkableSetting className={"email-preference"} id={"news-preference"}>
                <StyledCheckbox checked={emailPreferences?.NEWS_AND_UPDATES ?? false} id={`${idPrefix}news`}
                    onChange={(e) => setEmailPreferences({
                        ...emailPreferences,
                        NEWS_AND_UPDATES: e.target.checked
                    })}
                    label={<span><b>{t("common:account.emailPreferences.tipsLabel")}</b></span>}
                />
                <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.news}</span>
            </WithLinkableSetting>

            <WithLinkableSetting className={"email-preference"} id={"events-preference"}>
                <StyledCheckbox checked={emailPreferences?.EVENTS ?? false} id={`${idPrefix}events`}
                    onChange={(e) => setEmailPreferences({...emailPreferences, EVENTS: e.target.checked})}
                    label={<span><b>{t("common:account.emailPreferences.eventsLabel")}</b></span>}
                />
                <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.events}</span>
            </WithLinkableSetting>
        </>}
    </FormGroup>;
};

// Extended useState hook for email preferences, setting defaults
export const useEmailPreferenceState = (initialEmailPreferences?: Nullable<UserEmailPreferences>): [Nullable<UserEmailPreferences>, Dispatch<SetStateAction<Nullable<UserEmailPreferences>>>] => {
    const [emailPreferences, _setEmailPreferences] = useState<Nullable<UserEmailPreferences>>({...EMAIL_PREFERENCE_DEFAULTS, ...initialEmailPreferences});
    const setEmailPreferences = (newEmailPreferences: Nullable<UserEmailPreferences> | ((ep: Nullable<UserEmailPreferences>) => Nullable<UserEmailPreferences>)) => {
        if (typeof newEmailPreferences === "function") {
            return _setEmailPreferences((old) => ({...EMAIL_PREFERENCE_DEFAULTS, ...(newEmailPreferences(old))}));
        }
        return _setEmailPreferences({...EMAIL_PREFERENCE_DEFAULTS, ...newEmailPreferences});
    };
    return [emailPreferences, setEmailPreferences];
};
