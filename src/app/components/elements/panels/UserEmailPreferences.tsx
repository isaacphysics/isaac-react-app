import {CardBody, FormGroup, Table} from "reactstrap";
import React, {useEffect} from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {TrueFalseRadioInput} from "../inputs/TrueFalseRadioInput";
import {useAppSelector} from "../../../state/store";
import {AppState} from "../../../state/reducers";
import {validateEmailPreferences} from "../../../services/validation";
import {siteSpecific, SITE_SUBJECT_TITLE} from "../../../services/siteConstants";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
}
export const UserEmailPreference = ({emailPreferences, setEmailPreferences, submissionAttempted, idPrefix="my-account-"}: UserEmailPreferencesProps) => {
    const error = useAppSelector((state: AppState) => state && state.error);
    const defaultEmailPreferences = {ASSIGNMENTS: true};
    const isaacEmailPreferences = {
        assignments: siteSpecific(
            "Get notified when your teacher gives your group a new assignment.",
            "If you're a student, set this to 'Yes' to receive assignment notifications from your teacher."
        ),
        news: siteSpecific(
            "New content and website feature updates, as well as interesting news about Isaac.",
            "Be the first to know about new topics, new platform features, and our fantastic competition giveaways."
        ),
        events: siteSpecific(
            "Information about new virtual or real world physics events.",
            "Get valuable updates on our free student workshops/teacher CPD events happening near you."
        )
    };

    // initially set email preferences to default value
    // af599: I get what this useEffect is trying to do, but there must be a better way of doing it.
    useEffect(() => {
        setEmailPreferences(Object.assign(defaultEmailPreferences, emailPreferences))
    }, []);

    let errorMessage = null;
    if (error && error.type === "generalError") {
        errorMessage = error.generalError;
    } else  if (submissionAttempted && !validateEmailPreferences(emailPreferences)) {
        errorMessage = "Please specify all email preferences"
    }

    return <CardBody className="pb-0">
        <p>Get important information about the Isaac {SITE_SUBJECT_TITLE} programme delivered to your inbox.
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
                            {isaacEmailPreferences.assignments}
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
                            {isaacEmailPreferences.news}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}news`} stateObject={emailPreferences}
                                propertyName="NEWS_AND_UPDATES" setStateFunction={setEmailPreferences}
                                submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="form-required">Events</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferences.events}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}events`} stateObject={emailPreferences}
                                propertyName="EVENTS" setStateFunction={setEmailPreferences}
                                submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                </tbody>
            </Table>
            <hr />
            <div>
                <small>
                    <b>Frequency</b>: expect one email per term for News and a monthly bulletin for Events. Assignment notifications will be sent as needed by your teacher.
                </small>
            </div>
            {errorMessage && <h4 role="alert" className="text-danger text-center">
                {errorMessage}
            </h4>}
        </FormGroup>
    </CardBody>
};
