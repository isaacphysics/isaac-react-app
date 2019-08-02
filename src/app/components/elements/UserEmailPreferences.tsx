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
        <p>We know people don’t like getting unwanted spam, so we’ve made it easy to personalise and control the updates you receive from us.</p>
        <FormGroup className="overflow-auto">
            <Table className="mb-0">
                <thead>
                    <tr>
                        <th>Email Type</th>
                        <th className="d-none d-sm-table-cell">Description</th>
                        <th className="text-center">Preference</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="form-required">News</td>
                        <td className="d-none d-sm-table-cell">
                            Content updates, new website features, and other interesting news as it happens.
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
                        <td className="form-required">Assignments</td>
                        <td className="d-none d-sm-table-cell">
                            A notification when your teacher sets a new group assignment.
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
                        <td className="form-required">Events</td>
                        <td className="d-none d-sm-table-cell">
                            Information about our live events around England.
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
            {errorMessage && <h4 role="alert" className="text-danger text-center mb-4">
                {errorMessage}
            </h4>}
        </FormGroup>
    </CardBody>
};
