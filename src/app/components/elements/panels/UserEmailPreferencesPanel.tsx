import {CardBody, Col, Row} from "reactstrap";
import React from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {AppState, useAppSelector} from "../../../state";
import {SITE_TITLE, siteSpecific, validateEmailPreferences} from "../../../services";
import {UserEmailPreferencesInput} from "../inputs/UserEmailPreferencesInput";
import {Alert} from "../Alert";

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

    return <CardBody className="pb-0">
        {error?.type == "generalError" && <Alert title="Unable to update your account" body={error.generalError} />}
        <Row>
            <Col xs={12} lg={6} className="mb-4">
                <h3>Set your email notification preferences</h3>
                <p>Get important information about the {SITE_TITLE} programme delivered to your inbox. These settings can be changed at any time.</p>
                <b>Frequency</b>: expect one email per term for News{siteSpecific(" and a monthly bulletin for Events", "")}. Assignment notifications will be sent as needed by your teacher.
            </Col>
            <Col xs={12} lg={6}>
                <UserEmailPreferencesInput emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences} idPrefix={idPrefix}/>
            </Col>
        </Row>

    </CardBody>;
};
