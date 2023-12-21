import {StyledCheckbox} from "./CheckboxInput";
import {FormGroup} from "reactstrap";
import React, {SetStateAction, useState} from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {siteSpecific} from "../../../services";
import {Dispatch} from "react";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null | undefined;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    idPrefix?: string;
}

export const UserEmailPreferencesInput = ({emailPreferences, setEmailPreferences, idPrefix="my-account-"}: UserEmailPreferencesProps) => {

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

    return <FormGroup className="overflow-auto">
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
    </FormGroup>
}

// Extended useState hook for email preferences, setting defaults
export const useEmailPreferenceState = (initialEmailPreferences?: Nullable<UserEmailPreferences>): [Nullable<UserEmailPreferences>, Dispatch<SetStateAction<Nullable<UserEmailPreferences>>>] => {
    const defaults: UserEmailPreferences = {
        ASSIGNMENTS: true,
        NEWS_AND_UPDATES: false,
        EVENTS: false
    }

    const [emailPreferences, _setEmailPreferences] = useState<Nullable<UserEmailPreferences>>({...defaults, ...initialEmailPreferences});
    const setEmailPreferences = (newEmailPreferences: Nullable<UserEmailPreferences> | ((ep: Nullable<UserEmailPreferences>) => Nullable<UserEmailPreferences>)) => {
        console.log(newEmailPreferences);
        if (typeof newEmailPreferences === "function") {
            return _setEmailPreferences((old) => ({...defaults, ...(newEmailPreferences(old))}));
        }
        return _setEmailPreferences({...defaults, ...newEmailPreferences});
    };
    return [emailPreferences, setEmailPreferences];
};