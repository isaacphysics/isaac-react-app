import React, {useEffect, useState} from 'react';
import {connect, useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {AppState, ContentVersionState} from "../../state/reducers";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {
    getAdminSiteStats,
    getContentVersion,
    requestConstantsSegueVersion,
    setContentVersion
} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {ContentVersionUpdatingStatus} from "../../services/constants";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {DateString} from "../elements/DateString";

export const AdminEmail = () => {
    const dispatch = useDispatch();
    const [selectionMode, setSelectionMode] = useState("USER_FILTER")
    const [selectedRoles, setSelectedRoles] = useState([] as string[]);
    const [emailType, setEmailType] = useState("null");
    const [contentObjectID, setContentObjectID] = useState("");
    const userRolesSelector = useSelector((state: AppState) => state && state.adminStats && state.adminStats.userRoles);


    useEffect(() => {
        if (!userRolesSelector) {
            dispatch(getAdminSiteStats());
        }
    }, []);

    const updateSelectedRoles = (role: string, selected: boolean) => {
        const newSelectedRoles = Array.from(selectedRoles);
        const included = newSelectedRoles.includes(role);
        if (included && !selected) {
            newSelectedRoles.splice(newSelectedRoles.indexOf(role), 1);
        } else if (!included && selected) {
            newSelectedRoles.push(role);
        }

        setSelectedRoles(newSelectedRoles);
    };

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
                        userRolesSelector && Object.keys(userRolesSelector).sort().map((role: string) => {
                            debugger;
                            return <tr key={role}>
                                <td>
                                    {role + "(" + userRolesSelector[role] + ")"}
                                </td>
                                <td>
                                    <RS.Input
                                        type="checkbox" className="m-0 position-relative"
                                        checked={userRolesSelector[role] as string && selectedRoles.includes(userRolesSelector[role]) || undefined}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            updateSelectedRoles(role, event.target.checked)
                                        }}
                                    />
                                </td>
                            </tr>
                        })
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
                            id="" type="text" placeholder="Enter email content object ID"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setContentObjectID(e.target.value);
                            }}
                        >
                        </RS.Input>
                    </RS.Col>
                    <RS.Col>
                        <RS.Input
                            type="submit" value="Load template" className="btn btn-block btn-secondary border-0"
                        />
                    </RS.Col>
                </RS.Row>
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Subject:</RS.CardTitle>
            <RS.CardBody>
                Placeholder
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardBody>
                <RS.Input type="button" value="Send emails" className="btn btn-block btn-secondary border-0"/>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>
}