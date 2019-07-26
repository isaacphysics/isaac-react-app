import {CardBody, Col, FormGroup, Row, default as RS, Table} from "reactstrap";
import React, {useMemo} from "react";
import {UserEmailPreferences} from "../../../IsaacAppTypes";
import {TrueFalseRadioInput} from "./TrueFalseRadioInput";
import {useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {validateEmailPreferences} from "../../services/validation";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
}
export const UserEmailPreference = ({emailPreferences, setEmailPreferences, submissionAttempted, idPrefix="my-account-"}: UserEmailPreferencesProps) => {
    const error = useSelector((state: AppState) => state && state.error);
    const defaultEmailPreferences = {ASSIGNMENTS: true};

    // initially set email preferences to default value
    useMemo(() => {setEmailPreferences(Object.assign(defaultEmailPreferences, emailPreferences))}, []);

    let errorMessage = null;
    if (error && error.type === "generalError") {
        errorMessage = error.generalError;
    } else  if (submissionAttempted && !validateEmailPreferences(emailPreferences)) {
        errorMessage = "Please specify all email preferences"
    }

    return <CardBody className="pb-0">
        <p>Tell us which emails you would like to receive. These settings can be changed at any time.</p>
        <FormGroup>
            <Table className="mb-0">
                <thead>
                    <tr><th>Email Type</th><th>Description</th><th>Preference</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="form-required">News and Updates</td>
                        <td>New content and website feature updates, as well as interesting news about Isaac.</td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}news`} stateObject={emailPreferences}
                                propertyName="NEWS_AND_UPDATES" setStateFunction={setEmailPreferences}
                                submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="form-required">Assignments</td>
                        <td>Get notified when your teacher gives your group a new assignment.</td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}assignments`} stateObject={emailPreferences}
                                propertyName="ASSIGNMENTS" setStateFunction={setEmailPreferences}
                                submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="form-required">Events</td>
                        <td>Information about our computer science events.</td>
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
            {errorMessage && <h4 role="alert" className="text-danger text-center mb-4">
                {errorMessage}
            </h4>}
        </FormGroup>
    </CardBody>
};
