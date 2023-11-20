import {Button, CardBody, Col, FormGroup, Row} from "reactstrap";
import React, {Dispatch, SetStateAction, useState} from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {AppState, useAppSelector} from "../../../state";
import {SITE_TITLE, isAda, siteSpecific, validateEmailPreferences} from "../../../services";
import { StyledCheckbox } from "../inputs/CheckboxInput";

// Extended useState hook for email preferences, enforcing a default of {ASSIGNMENTS: true}
export const useEmailPreferenceState = (initialEmailPreferences?: Nullable<UserEmailPreferences>): [Nullable<UserEmailPreferences>, Dispatch<SetStateAction<Nullable<UserEmailPreferences>>>] => {
    const [emailPreferences, _setEmailPreferences] = useState<Nullable<UserEmailPreferences>>({ASSIGNMENTS: true, ...initialEmailPreferences});
    const setEmailPreferences = (newEmailPreferences: Nullable<UserEmailPreferences> | ((ep: Nullable<UserEmailPreferences>) => Nullable<UserEmailPreferences>)) => {
        console.log(newEmailPreferences);
        if (typeof newEmailPreferences === "function") {
            return _setEmailPreferences((old) => ({ASSIGNMENTS: true, ...(newEmailPreferences(old))}));
        }
        return _setEmailPreferences({ASSIGNMENTS: true, ...newEmailPreferences});
    };
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
        errorMessage = "Please specify all email preferences";
    }

    return <CardBody className="pb-0">
        <Row>
            <Col lg={6} xs={12} className="mb-4">
                <p>Get important information about the {SITE_TITLE} programme delivered to your inbox. These settings can be changed at any time.</p>
                <b>Frequency</b>: expect one email per term for News{siteSpecific(" and a monthly bulletin for Events", "")}. Assignment notifications will be sent as needed by your teacher.
            </Col>
            <Col lg={6} xs={12}>
                <FormGroup className="overflow-auto">
                    <StyledCheckbox initialValue={emailPreferences?.ASSIGNMENTS ?? false} id={`${idPrefix}assignments`}
                        changeFunction={(checked) => setEmailPreferences({...emailPreferences, ASSIGNMENTS: checked})}
                        label=<span><b>Assignments</b></span>
                    />
                    <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.assignments}</span>

                    <StyledCheckbox initialValue={emailPreferences?.NEWS_AND_UPDATES ?? false} id={`${idPrefix}news`}
                        changeFunction={(checked) => setEmailPreferences({...emailPreferences, NEWS_AND_UPDATES: checked})}
                        label=<span><b>News</b></span>
                    />
                    <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.news}</span>

                    <StyledCheckbox initialValue={emailPreferences?.EVENTS ?? false} id={`${idPrefix}events`}
                        changeFunction={(checked) => setEmailPreferences({...emailPreferences, EVENTS: checked})}
                        label=<span><b>Events</b></span>
                    />
                    <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.events}</span>

                    {/* <StyledCheckbox initialValue={emailPreferences?.RESEARCH} id={`${idPrefix}research`}
                        changeFunction={(checked) => setEmailPreferences({...emailPreferences, RESEARCH: checked})}
                        label=<span><b>Assignments</b></span>
                        />
                    <span>{isaacEmailPreferenceDescriptions.research}</span> */}
                    
                    {isAda && <Button type="submit" color="primary" className="w-100" disabled={submissionAttempted && !!errorMessage}>
                        Save
                    </Button>}
                </FormGroup>
            </Col>
        </Row>
        {errorMessage && <>
            <hr />
            <h4 role="alert" className="text-danger text-center">
                {errorMessage}
            </h4>
        </>}
    </CardBody>;
};
