import {CardBody, FormGroup, Table} from "reactstrap";
import React, {Dispatch, SetStateAction, useState} from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {TrueFalseRadioInput} from "../inputs/TrueFalseRadioInput";
import {AppState, useAppSelector} from "../../../state";
import {isPhy, SITE_TITLE, siteSpecific, validateEmailPreferences} from "../../../services";

// Extended useState hook for email preferences, enforcing a default of {ASSIGNMENTS: true}
export const useEmailPreferenceState = (initialEmailPreferences?: Nullable<UserEmailPreferences>): [Nullable<UserEmailPreferences>, Dispatch<SetStateAction<Nullable<UserEmailPreferences>>>] => {
    const [emailPreferences, _setEmailPreferences] = useState<Nullable<UserEmailPreferences>>({ASSIGNMENTS: true, ...initialEmailPreferences});
    const setEmailPreferences = (newEmailPreferences: Nullable<UserEmailPreferences> | ((ep: Nullable<UserEmailPreferences>) => Nullable<UserEmailPreferences>)) => {
        if (typeof newEmailPreferences === "function") {
            return _setEmailPreferences((old) => ({ASSIGNMENTS: true, ...(newEmailPreferences(old))}));
        }
        return _setEmailPreferences({ASSIGNMENTS: true, ...newEmailPreferences});
    }
    return [emailPreferences, setEmailPreferences];
};

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null | undefined;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
}
export const UserEmailPreference = ({emailPreferences, setEmailPreferences, submissionAttempted, idPrefix="my-account-"}: UserEmailPreferencesProps) => {
    const error = useAppSelector((state: AppState) => state && state.error);
    const isaacEmailPreferenceDescriptions = {
        assignments: siteSpecific(
            "Get notified when your teacher gives your group a new assignment.",
            "If you're a student, set this to 'Yes' to receive assignment notifications from your teacher."
        ),
        news: siteSpecific(
            "New content and website feature updates, as well as interesting news about Isaac.",
            "Be the first to know about new topics and platform features."
        ),
        events: siteSpecific(
            "Information about new virtual or real world physics events.",
            "Get valuable updates on our free student workshops/teacher CPD events happening near you."
        )
    };

    let errorMessage = null;
    if (error && error.type === "generalError") {
        errorMessage = error.generalError;
    } else  if (submissionAttempted && !validateEmailPreferences(emailPreferences)) {
        errorMessage = "Please specify all email preferences"
    }

    return <CardBody className="pb-0">
        <p>Get important information about the {SITE_TITLE} programme delivered to your inbox.
            These settings can be changed at any time.</p>
        <FormGroup className="overflow-auto">
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
            <hr />
            <div>
                <small>
                    <b>Frequency</b>: expect one email per term for News{siteSpecific(" and a monthly bulletin for Events", "")}. Assignment notifications will be sent as needed by your teacher.
                </small>
            </div>
            {errorMessage && <h4 role="alert" className="text-danger text-center">
                {errorMessage}
            </h4>}
        </FormGroup>
    </CardBody>
};
