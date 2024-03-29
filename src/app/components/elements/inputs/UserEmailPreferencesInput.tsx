import {StyledCheckbox} from "./CheckboxInput";
import {FormGroup, Table} from "reactstrap";
import React, {SetStateAction, useState} from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {EMAIL_PREFERENCE_DEFAULTS, isPhy, siteSpecific} from "../../../services";
import {Dispatch} from "react";
import { TrueFalseRadioInput } from "./TrueFalseRadioInput";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null | undefined;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    submissionAttempted?: boolean;
    idPrefix?: string;
}

export const UserEmailPreferencesInput = ({emailPreferences, setEmailPreferences, submissionAttempted, idPrefix="my-account-"}: UserEmailPreferencesProps) => {

    const isaacEmailPreferenceDescriptions = {
        assignments: siteSpecific(
            "Get notified when your teacher gives your group a new assignment.",
            "Receive notifications when your teacher sets you work. These are sent as needed by your teacher."
        ),
        news: siteSpecific(
            "New content and website feature updates, as well as interesting news about Isaac.",
            "Be the first to know about new questions, topics, and platform features. You can expect one email a month."
        ),
        events: siteSpecific(
            "Information about new virtual or real world physics events.",
            "Find out about upcoming events."
        )
    };

    return <FormGroup className="overflow-auto">
        {isPhy && submissionAttempted !== undefined ? <> {/* submissionAttempted should always exist on phy, just here for typing */}
            <Table className="mb-0">
                <thead>
                    <tr>
                        <th>Email type</th>
                        <th className="d-none d-sm-table-cell">Description</th>
                        <th className="text-center">Preference</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="form-required">Assignments</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.assignments}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}assignments`} stateObject={emailPreferences}
                                propertyName="ASSIGNMENTS" setStateFunction={setEmailPreferences}
                                submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="form-required">News</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.news}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}news`} stateObject={emailPreferences}
                                propertyName="NEWS_AND_UPDATES" setStateFunction={setEmailPreferences}
                                submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    {isPhy && <tr>
                        <td className="form-required">Events</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.events}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}events`} stateObject={emailPreferences}
                                propertyName="EVENTS" setStateFunction={setEmailPreferences}
                                submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>}
                </tbody>
            </Table>
        </> : <>
            <StyledCheckbox initialValue={emailPreferences?.ASSIGNMENTS ?? false} id={`${idPrefix}assignments`}
                changeFunction={(checked) => setEmailPreferences({...emailPreferences, ASSIGNMENTS: checked})}
                label={<span><b>Assignments</b></span>}
            />
            <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.assignments}</span>

            <StyledCheckbox initialValue={emailPreferences?.NEWS_AND_UPDATES ?? false} id={`${idPrefix}news`}
                changeFunction={(checked) => setEmailPreferences({...emailPreferences, NEWS_AND_UPDATES: checked})}
                label={<span><b>News</b></span>}
            />
            <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.news}</span>

            <StyledCheckbox initialValue={emailPreferences?.EVENTS ?? false} id={`${idPrefix}events`}
                changeFunction={(checked) => setEmailPreferences({...emailPreferences, EVENTS: checked})}
                label={<span><b>Events</b></span>}
            />
            <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.events}</span>
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
