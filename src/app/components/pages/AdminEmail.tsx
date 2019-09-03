import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {AppState} from "../../state/reducers";
import {getAdminSiteStats, getEmailTemplate, sendAdminEmail} from "../../state/actions";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EmailUserRoles} from "../../../IsaacApiTypes";
import {UserRole} from "../../services/constants";

export const AdminEmail = () => {
    const dispatch = useDispatch();
    const [selectionMode, setSelectionMode] = useState("USER_FILTER")
    const [selectedRoles, setSelectedRoles] = useState({
        ADMIN: false,
        EVENT_MANAGER: false,
        CONTENT_EDITOR: false,
        TEACHER: false,
        TESTER: false,
        STAFF: false,
        STUDENT: false
    } as EmailUserRoles);
    const [emailType, setEmailType] = useState("null");
    const [contentObjectID, setContentObjectID] = useState("");
    const userRolesSelector = useSelector((state: AppState) => state && state.adminStats && state.adminStats.userRoles);
    const emailTemplateSelector = useSelector((state: AppState) => state && state.adminEmailTemplate && state.adminEmailTemplate);


    useEffect(() => {
        if (!userRolesSelector) {
            dispatch(getAdminSiteStats());
        }
    }, []);

    return <RS.Container id="admin-stats-page">
        <TitleAndBreadcrumb currentPageTitle="Admin email" />

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">User selection</RS.CardTitle>
            <RS.CardBody>
                <RS.Input
                    id="email-type-input" type="select" defaultValue={selectionMode}
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
                                    {role + "(" + (userRolesSelector[role] || 0) + ")"}
                                </td>
                                <td>
                                    <RS.Input
                                        type="checkbox" className="m-0 position-relative"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            const newSelectedRoles = {...selectedRoles}
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

                {selectionMode == "CSV_USER_ID_LIST" && <RS.Input type = "textarea">

                </RS.Input>
                }
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Email type</RS.CardTitle>
            <RS.CardBody>
                <RS.Label>The type of email you are sending. Users who have opted out of this type of email will not receive anything. </RS.Label>
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
                            type="submit" value="Load template" className="btn btn-block btn-secondary border-0" onClick={() => dispatch(getEmailTemplate(contentObjectID))}
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
            <RS.Label>The preview below uses fields taken from your account (e.g. givenname and familyname).</RS.Label>
            <RS.CardBody>
                {emailTemplateSelector && emailTemplateSelector.html && <div dangerouslySetInnerHTML={{__html: emailTemplateSelector.html}} />}
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Plain text preview</RS.CardTitle>
            <RS.Label>The preview below uses fields taken from your account (e.g. givenname and familyname).</RS.Label>
            <RS.CardBody>
                {emailTemplateSelector && emailTemplateSelector.plainText}
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardBody>
                <RS.Input type="button" value="Send emails" className="btn btn-block btn-secondary border-0"
                          onClick={() => {
                              if (selectionMode == "USER_FILTER") {
                                  sendAdminEmail(contentObjectID, emailType, selectedRoles);
                              } else {
                                  // sendAdminEmail(contentObjectID, emailType, undefiend);
                              }}
                          }/>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>
};