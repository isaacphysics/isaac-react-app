import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {AppState} from "../../state/reducers";
import {getAdminSiteStats, getEmailTemplate, sendAdminEmail, sendAdminEmailWithIds} from "../../state/actions";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EmailUserRoles} from "../../../IsaacAppTypes";
import {UserRole} from "../../services/constants";
import classnames from "classnames";
import {debounce} from 'lodash';

interface AdminEmailsProps {
    location: {
        state?: {
            csvIDs?: number[];
        };
    };
}

const RECIPIENT_NUMBER_WARNING_VALUE = 2000;

export const AdminEmails = (props: AdminEmailsProps) => {
    const dispatch = useDispatch();
    const [selectionMode, setSelectionMode] = useState("USER_FILTER");
    const defaultSelectedRoles: EmailUserRoles = {
        ADMIN: false,
        EVENT_MANAGER: false,
        CONTENT_EDITOR: false,
        EVENT_LEADER: false,
        TEACHER: false,
        STUDENT: false
    };
    const [selectedRoles, setSelectedRoles] = useState(defaultSelectedRoles);
    const [csvIDs, setCSVIDs] = useState([] as number[]);
    const [emailType, setEmailType] = useState("null");
    const [contentObjectID, setContentObjectID] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const userRolesSelector = useSelector((state: AppState) => state && state.adminStats && state.adminStats.userRoles);
    const emailTemplateSelector = useSelector((state: AppState) => state && state.adminEmailTemplate && state.adminEmailTemplate);

    const numberOfUsers = () => {
        if (selectionMode == "USER_FILTER") {
            if (userRolesSelector) {
                return Object.entries(selectedRoles).map(([role, enabled]) => enabled ? userRolesSelector[role] || 0 : 0).reduce((x, y) => x + y, 0);
            } else {
                return 0;
            }
        } else {
            return csvIDs.length;
        }
    };
    const canSubmit = emailTemplateSelector && emailType != "null" && numberOfUsers() > 0;
    const csvInputDebounce = debounce((value: string) => setCSVIDs(value.split(/[\s,]+/).map((e) => {return parseInt(e)}).filter((num) => !isNaN(num))), 250);

    useEffect(() => {
        if (props.location.state && props.location.state.csvIDs) {
            setCSVIDs(props.location.state.csvIDs);
            setSelectionMode("CSV_USER_ID_LIST");
        }
        if (!userRolesSelector) {
            dispatch(getAdminSiteStats());
        }
    }, []);

    return <RS.Container id="admin-emails-page">
        <TitleAndBreadcrumb currentPageTitle="Admin emails" />

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">User selection</RS.CardTitle>
            <RS.CardBody>
                <RS.Input
                    id="email-recipient-type-input" type="select" className="mb-4" defaultValue={selectionMode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSelectionMode(e.target.value);
                    }}
                >
                    <option value="USER_FILTER">User filter</option>
                    <option value="CSV_USER_ID_LIST">CSV User ID list</option>
                </RS.Input>

                {selectionMode == "USER_FILTER" && <RS.Table bordered>
                    <thead>
                        <tr>
                            <th>User type</th>
                            <th>Include</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            userRolesSelector && Object.keys(selectedRoles).map((role: string) =>
                                <tr key={role}>
                                    <td>
                                        {`${role}(${(userRolesSelector[role] || 0)})`}
                                    </td>
                                    <td>
                                        <RS.Input
                                            type="checkbox" className="m-0 position-relative"
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                const newSelectedRoles = {...selectedRoles};
                                                newSelectedRoles[role as UserRole] = event.target.checked;
                                                setSelectedRoles(newSelectedRoles);
                                            }}
                                        />
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </RS.Table>
                }

                {selectionMode == "CSV_USER_ID_LIST" && <RS.Input
                    type = "textarea"
                    defaultValue={csvIDs.join(", ")}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        csvInputDebounce(event.target.value);
                    }}
                />
                }
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Email type</RS.CardTitle>
            <RS.CardBody>
                <RS.Label>The type of email you are sending.</RS.Label>
                <p>Users who have opted out of this type of email will
                    not receive anything. Administrative emails cannot be opted out of and should be avoided.</p>
                <RS.Input
                    id="email-type-input" type="select" defaultValue={emailType}
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

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Subject:</RS.CardTitle>
            <RS.CardBody>
                {emailTemplateSelector && emailTemplateSelector.subject}
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">HTML preview</RS.CardTitle>
            <RS.Label>The preview below uses fields taken from your account (e.g. givenName and familyName).</RS.Label>
            <RS.CardBody>
                {emailTemplateSelector && emailTemplateSelector.html &&
                <iframe title="Email content preview" className="email-preview-frame" srcDoc={emailTemplateSelector.html} />
                }
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Plain text preview</RS.CardTitle>
            <RS.Label>The preview below uses fields taken from your account (e.g. givenName and familyName).</RS.Label>
            <RS.CardBody>
                <pre>{emailTemplateSelector && emailTemplateSelector.plainText}</pre>
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="mb-5">
            <RS.CardBody>
                <div className="text-center">
                    {!emailSent ?
                        <React.Fragment>
                            {numberOfUsers() >= RECIPIENT_NUMBER_WARNING_VALUE && <div className="alert alert-warning">
                                <strong>Warning:</strong> There are currently <strong>{numberOfUsers()}</strong> selected recipients.
                            </div>}
                            <RS.Input
                                type="button" value="Send emails"
                                className={"btn btn-xl btn-secondary border-0 " + classnames({disabled: !canSubmit})}
                                disabled={!canSubmit}
                                onClick={() => {
                                    const numUsers = numberOfUsers();
                                    if (window.confirm(`Are you sure you want to send a ${emailType} email (${contentObjectID}) to ${numUsers} user${numUsers > 1 ? "s" : ""}?`)) {
                                        setEmailSent(true);
                                        if (selectionMode == "USER_FILTER") {
                                            dispatch(sendAdminEmail(contentObjectID, emailType, selectedRoles));
                                        } else {
                                            dispatch(sendAdminEmailWithIds(contentObjectID, emailType, csvIDs));
                                        }
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
