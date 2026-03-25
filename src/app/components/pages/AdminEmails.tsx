import React, {useEffect, useState} from 'react';
import {
    AppState,
    useAppSelector,
    useLazyGetTemplateEmailQuery,
    useSendAdminEmailWithIdsMutation
} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import debounce from 'lodash/debounce';
import {isEventManager, siteSpecific} from "../../services";
import { Container, Card, CardTitle, CardBody, Label, Input, Row, Col, Button } from 'reactstrap';
import { useLocation } from 'react-router';

const RECIPIENT_NUMBER_WARNING_VALUE = 2000;

export const AdminEmails = () => {
    const location = useLocation();
    const [csvIDs, setCSVIDs] = useState(location.state?.csvIDs || [] as number[]);
    const [emailType, setEmailType] = useState("null");
    const [contentObjectID, setContentObjectID] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const user = useAppSelector((state: AppState) => state?.user);

    const [getEmailTemplate, {data: emailTemplate}] = useLazyGetTemplateEmailQuery();
    const [sendAdminEmailWithIds] = useSendAdminEmailWithIdsMutation();

    const numberOfUsers = csvIDs.length;
    const canSubmit = emailTemplate && emailType != "null" && numberOfUsers > 0;
    const csvInputDebounce = debounce((value: string) => setCSVIDs(value.split(/[\s,]+/).map((e) => {return parseInt(e);}).filter((num) => !isNaN(num))), 250);

    useEffect(() => {
        isEventManager(user) && setEmailType("EVENTS");
    }, [user]);

    return <Container id="admin-emails-page">
        <TitleAndBreadcrumb 
            currentPageTitle="Admin emails" 
            icon={{type: "icon", icon: "icon-contact"}}
        />

        <Card className="p-3 my-3">
            <CardTitle tag="h2">User selection</CardTitle>
            <CardBody>
                <Label>Comma separated list of user IDs to email.</Label>
                <Input
                    id="email-user-ids-input"
                    type = "textarea"
                    defaultValue={csvIDs.join(", ")}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        csvInputDebounce(event.target.value);
                    }}
                />
            </CardBody>
        </Card>

        <Card className="p-3 my-3">
            <CardTitle tag="h2">Email type</CardTitle>
            <CardBody>
                <Label>The type of email you are sending.</Label>
                <p>Users who have opted out of this type of email will
                    not receive anything. Administrative emails cannot be opted out of and should be avoided.</p>
                <Input
                    id="email-type-input" type="select" value={emailType}
                    disabled={isEventManager(user)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmailType(e.target.value);
                    }}
                >
                    <option value="null">--- Make a selection ---</option>
                    <option value="ASSIGNMENTS">Assignments</option>
                    <option value="NEWS_AND_UPDATES">News and updates</option>
                    <option value="EVENTS">Events</option>
                    <option value="ADMIN">Urgent administrative email</option>
                </Input>
            </CardBody>
        </Card>

        <Card className="p-3 my-3">
            <CardTitle tag="h2">Content object</CardTitle>
            <CardBody>
                <Row>
                    <Col>
                        <Input
                            id="content-object-id-input" type="text" placeholder="Enter email content object ID"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setContentObjectID(e.target.value);
                            }}
                        >
                        </Input>
                    </Col>
                    <Col>
                        <Button type="submit" color="secondary" disabled={contentObjectID.length == 0}
                            onClick={() => getEmailTemplate(contentObjectID)} className={siteSpecific("w-100", "form-control border-0")}>
                            Load template
                        </Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>

        {emailTemplate && <>
            <Card className="p-3 my-3">
                <CardTitle tag="h2">Details</CardTitle>
                <CardBody>
                    <ul>
                        <li><b>Subject:</b> {emailTemplate.subject || "no subject"}</li>
                        {emailTemplate.from && <li><b>From:</b> {emailTemplate.fromName || ""} &lt;{emailTemplate.from}&gt;</li>}
                        {emailTemplate.replyTo && <li><b>Reply-To:</b> {emailTemplate.replyToName || ""} &lt;{emailTemplate.replyTo}&gt;</li>}
                        <li><b>Sent via:</b>&nbsp;
                            {emailTemplate.sender?.includes("@mail.isaac") ? "MailGun" : "University"}
                        </li>
                    </ul>
                </CardBody>
            </Card>

            <Card className="p-3 my-3">
                <CardTitle tag="h2">HTML preview</CardTitle>
                <Label>The preview below uses fields taken from your account (e.g. givenName and familyName).</Label>
                <CardBody>
                    {emailTemplate.html &&
                        <iframe title="Email content preview" className="email-preview-frame" srcDoc={emailTemplate.html}/>
                    }
                </CardBody>
            </Card>

            <Card className="p-3 my-3">
                <CardTitle tag="h2">Plain text preview</CardTitle>
                <Label>The preview below uses fields taken from your account (e.g. givenName and familyName).</Label>
                <CardBody>
                    <pre>{emailTemplate.plainText}</pre>
                </CardBody>
            </Card>
        </>}

        <Card className="mb-7">
            <CardBody>
                <div className="text-center">
                    {!emailSent ?
                        <React.Fragment>
                            {numberOfUsers >= RECIPIENT_NUMBER_WARNING_VALUE && <div className="alert alert-warning">
                                <strong>Warning:</strong> There are currently <strong>{numberOfUsers}</strong> selected recipients.
                            </div>}
                            <Button type='button' color="secondary" disabled={!canSubmit} className={siteSpecific("btn-xl", "form-control border-0")}
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to send a ${emailType} email (${contentObjectID}) to ${numberOfUsers} user${numberOfUsers > 1 ? "s" : ""}?`)) {
                                        setEmailSent(true);
                                        sendAdminEmailWithIds({contentId: contentObjectID, emailType, ids: csvIDs});
                                    }
                                }}>
                                Send emails
                            </Button>
                        </React.Fragment>
                        :
                        <React.Fragment>Request made, to send another refresh.</React.Fragment>
                    }
                </div>
            </CardBody>
        </Card>
    </Container>;
};
