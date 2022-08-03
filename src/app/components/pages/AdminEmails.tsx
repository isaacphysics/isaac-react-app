import React, {useEffect, useState} from 'react';
import {AppState, getEmailTemplate, sendAdminEmailWithIds, useAppDispatch, useAppSelector} from "../../state";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import classnames from "classnames";
import {debounce} from 'lodash';
import {isEventManager} from "../../services/user";

interface AdminEmailsProps {
    location: {
        state?: {
            csvIDs?: number[];
        };
    };
}

const RECIPIENT_NUMBER_WARNING_VALUE = 2000;

export const AdminEmails = (props: AdminEmailsProps) => {
    const dispatch = useAppDispatch();
    const [csvIDs, setCSVIDs] = useState(props.location.state?.csvIDs || [] as number[]);
    const [emailType, setEmailType] = useState("null");
    const [contentObjectID, setContentObjectID] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const user = useAppSelector((state: AppState) => state?.user);
    const emailTemplateSelector = useAppSelector((state: AppState) => state && state.adminEmailTemplate && state.adminEmailTemplate);

    const numberOfUsers = csvIDs.length;
    const canSubmit = emailTemplateSelector && emailType != "null" && numberOfUsers > 0;
    const csvInputDebounce = debounce((value: string) => setCSVIDs(value.split(/[\s,]+/).map((e) => {return parseInt(e)}).filter((num) => !isNaN(num))), 250);

    useEffect(() => {
        isEventManager(user) && setEmailType("EVENTS");
    }, [user]);

    return <RS.Container id="admin-emails-page">
        <TitleAndBreadcrumb currentPageTitle="Admin emails" />

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">User selection</RS.CardTitle>
            <RS.CardBody>
                <RS.Label>Comma separated list of user IDs to email.</RS.Label>
                <RS.Input
                    id="email-user-ids-input"
                    type = "textarea"
                    defaultValue={csvIDs.join(", ")}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        csvInputDebounce(event.target.value);
                    }}
                />
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Email type</RS.CardTitle>
            <RS.CardBody>
                <RS.Label>The type of email you are sending.</RS.Label>
                <p>Users who have opted out of this type of email will
                    not receive anything. Administrative emails cannot be opted out of and should be avoided.</p>
                <RS.Input
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
                </RS.Input>
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Content object</RS.CardTitle>
            <RS.CardBody>
                <RS.Row>
                    <RS.Col>
                        <RS.Input
                            id="content-object-id-input" type="text" placeholder="Enter email content object ID"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setContentObjectID(e.target.value);
                            }}
                        >
                        </RS.Input>
                    </RS.Col>
                    <RS.Col>
                        <RS.Input
                            type="submit" value="Load template"
                            className={"btn btn-block btn-secondary border-0 " + classnames({disabled: contentObjectID.length == 0})}
                            disabled={contentObjectID.length == 0}
                            onClick={() => dispatch(getEmailTemplate(contentObjectID))}
                        />
                    </RS.Col>
                </RS.Row>
            </RS.CardBody>
        </RS.Card>

        {emailTemplateSelector && <>
            <RS.Card className="p-3 my-3">
                <RS.CardTitle tag="h2">Details</RS.CardTitle>
                <RS.CardBody>
                    <ul>
                        <li><b>Subject:</b> {emailTemplateSelector.subject || "no subject"}</li>
                        {emailTemplateSelector.from && <li><b>From:</b> {emailTemplateSelector.fromName || ""} &lt;{emailTemplateSelector.from}&gt;</li>}
                        {emailTemplateSelector.replyTo && <li><b>Reply-To:</b> {emailTemplateSelector.replyToName || ""} &lt;{emailTemplateSelector.replyTo}&gt;</li>}
                        <li><b>Sent via:</b>&nbsp;
                            {emailTemplateSelector.sender?.includes("@mail.isaac") ? "MailGun" : "University"}
                        </li>
                    </ul>
                </RS.CardBody>
            </RS.Card>

            <RS.Card className="p-3 my-3">
                <RS.CardTitle tag="h2">HTML preview</RS.CardTitle>
                <RS.Label>The preview below uses fields taken from your account (e.g. givenName and familyName).</RS.Label>
                <RS.CardBody>
                    {emailTemplateSelector.html &&
                        <iframe title="Email content preview" className="email-preview-frame" srcDoc={emailTemplateSelector.html}/>
                    }
                </RS.CardBody>
            </RS.Card>

            <RS.Card className="p-3 my-3">
                <RS.CardTitle tag="h2">Plain text preview</RS.CardTitle>
                <RS.Label>The preview below uses fields taken from your account (e.g. givenName and familyName).</RS.Label>
                <RS.CardBody>
                    <pre>{emailTemplateSelector.plainText}</pre>
                </RS.CardBody>
            </RS.Card>
            </>
        }

        <RS.Card className="mb-5">
            <RS.CardBody>
                <div className="text-center">
                    {!emailSent ?
                        <React.Fragment>
                            {numberOfUsers >= RECIPIENT_NUMBER_WARNING_VALUE && <div className="alert alert-warning">
                                <strong>Warning:</strong> There are currently <strong>{numberOfUsers}</strong> selected recipients.
                            </div>}
                            <RS.Input
                                type="button" value="Send emails"
                                className={"btn btn-xl btn-secondary border-0 " + classnames({disabled: !canSubmit})}
                                disabled={!canSubmit}
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to send a ${emailType} email (${contentObjectID}) to ${numberOfUsers} user${numberOfUsers > 1 ? "s" : ""}?`)) {
                                        setEmailSent(true);
                                        dispatch(sendAdminEmailWithIds(contentObjectID, emailType, csvIDs));
                                    }
                                }}
                            />
                        </React.Fragment>
                        :
                        <React.Fragment>Request made, to send another refresh.</React.Fragment>
                    }
                </div>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>;
};
