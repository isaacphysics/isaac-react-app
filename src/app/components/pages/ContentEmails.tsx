import React, {useEffect, useState} from 'react';
import {useSendProvidedEmailWithUserIdsMutation} from "../../state";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import debounce from 'lodash/debounce';
import {convert} from 'html-to-text';
import {siteSpecific} from "../../services";
import {EmailTemplateDTO} from "../../../IsaacApiTypes";
import { Container, Card, CardTitle, CardBody, Label, Input, Button } from 'reactstrap';
import { useLocation } from 'react-router';

const RECIPIENT_NUMBER_WARNING_VALUE = 2000;

const ContentEmails = () => {
    const location = useLocation();
    const [csvIDs, setCSVIDs] = useState(location.state?.csvIDs || [] as number[]);
    const [emailType, setEmailType] = useState("null");
    const [emailSent, setEmailSent] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [htmlTemplate, setHtmlTemplate] = useState("");
    const [plaintextTemplate, setPlaintextTemplate] = useState("");
    const [overrideEnvelopeFrom, setOverrideEnvelopeFrom] = useState<string|undefined>();
    const [emailTemplate, setEmailTemplate] = useState<EmailTemplateDTO>({});

    const numberOfUsers = csvIDs.length;
    const canSubmit = emailTemplate?.subject?.length != 0 && emailTemplate?.htmlContent?.length != 0 && emailTemplate?.plainTextContent?.length != 0 && emailType != "null" && numberOfUsers > 0;
    const csvInputDebounce = debounce((value: string) => setCSVIDs(value.split(/[\s,]+/).map((e) => {return parseInt(e);}).filter((num) => !isNaN(num))), 250);

    useEffect(() => {
        setPlaintextTemplate(convert(htmlTemplate));
    }, [htmlTemplate]);

    useEffect(() => {
        setEmailTemplate({
            subject: emailSubject,
            plainTextContent: plaintextTemplate,
            htmlContent: htmlTemplate,
            overrideEnvelopeFrom: overrideEnvelopeFrom,
        });
    }, [emailSubject, plaintextTemplate, htmlTemplate, overrideEnvelopeFrom]);

    const mailgunAddress = siteSpecific("no-reply@mail.isaacscience.org", "no-reply@mail.adacomputerscience.org");

    const [sendProvidedEmailWithUserIds] = useSendProvidedEmailWithUserIdsMutation();

    return <Container id="admin-emails-page">
        <TitleAndBreadcrumb currentPageTitle="Content email sending" icon={{type: "icon", icon: "icon-mail"}} />

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
            <CardTitle tag="h2">Email subject</CardTitle>
            <CardBody>
                <Label>Email subject</Label>
                <Input
                    id="email-subject-input" type="text" value={emailSubject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmailSubject(e.target.value);
                    }}
                >
                </Input>
            </CardBody>
        </Card>

        <Card className="p-3 my-3">
            <CardTitle tag="h2">Email Template</CardTitle>
            <CardBody>
                <Label>Email HTML</Label>
                <Input
                    id="email-html-input"
                    type = "textarea"
                    defaultValue={htmlTemplate}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setHtmlTemplate(event.target.value);
                    }}
                    rows={10}
                />
            </CardBody>
            <CardBody>
                <Label>HTML Preview (unformatted)</Label>
                <iframe title={"html preview"} srcDoc={htmlTemplate} className="email-html"/>
            </CardBody>
            <CardBody>
                <Label>Email Plaintext</Label>
                <Input
                    id="email-plaintext-input"
                    type = "textarea"
                    value={plaintextTemplate}
                    disabled={true}
                    rows={10}
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
            <CardTitle tag="h2">Send via</CardTitle>
            <CardBody>
                <Label>The method of sending the email</Label>
                <Input
                    id="email-type-input" type="select" value={overrideEnvelopeFrom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setOverrideEnvelopeFrom(e.target.value);
                    }}
                >
                    <option value={undefined}>Isaac</option>
                    <option value={mailgunAddress}>Mailgun</option>
                </Input>
            </CardBody>
        </Card>

        <Card className="mb-7">
            <CardBody>
                <div className="text-center">
                    {!emailSent ?
                        <React.Fragment>
                            {numberOfUsers >= RECIPIENT_NUMBER_WARNING_VALUE && <div className="alert alert-warning">
                                <strong>Warning:</strong> There are currently <strong>{numberOfUsers}</strong> selected recipients.
                            </div>}
                            <Button
                                type="button" color="secondary" className={siteSpecific("btn-xl", "form-control border-0")}
                                disabled={!canSubmit}
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to send a ${emailType} email to ${numberOfUsers} user${numberOfUsers > 1 ? "s" : ""}?`)) {
                                        setEmailSent(true);
                                        void sendProvidedEmailWithUserIds({emailTemplate, emailType, ids: csvIDs});
                                    }
                                }}
                            >Send emails</Button>
                        </React.Fragment>
                        :
                        <React.Fragment>Request made, to send another refresh.</React.Fragment>
                    }
                </div>
            </CardBody>
        </Card>
    </Container>;
};
export default ContentEmails;
