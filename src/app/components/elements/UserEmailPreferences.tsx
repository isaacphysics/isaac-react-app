import {CardBody, CustomInput, Form, FormGroup, Table} from "reactstrap";
import React from "react";
import {UserEmailPreferences} from "../../../IsaacAppTypes";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null;
    setEmailPreferences: (e: any) => void;
}

export const UserEmailPreference = ({emailPreferences, setEmailPreferences}: UserEmailPreferencesProps) => {
    return <CardBody>
        <p>Tell us which emails you would like to receive. These settings can be changed at any time.</p>
        <FormGroup>
            <Table>
                <thead>
                    <tr>
                        <th>Email Type</th>
                        <th>Description</th>
                        <th>Preference</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Assignments</td>
                        <td>Get notified when your teacher gives your group a new assignment.</td>
                        <td>
                            <CustomInput
                                id="assignments" type="checkbox" name="assignments"
                                defaultChecked={emailPreferences ? emailPreferences.ASSIGNMENTS : true}
                                onChange={(e: any) => setEmailPreferences(
                                    Object.assign({}, emailPreferences, {ASSIGNMENTS: emailPreferences ? !emailPreferences.ASSIGNMENTS : true})
                                )}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>News and Updates</td>
                        <td>New content and website feature updates, as well as interesting news about Isaac.</td>
                        <td>
                            <CustomInput
                                id="news" type="checkbox" name="news" color="$secondary"
                                defaultChecked={emailPreferences ? emailPreferences.NEWS_AND_UPDATES : true}
                                onChange={(e: any) => setEmailPreferences(
                                    Object.assign({}, emailPreferences, {NEWS_AND_UPDATES: emailPreferences? !emailPreferences.NEWS_AND_UPDATES : true}))
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Events</td>
                        <td>Information about our computer science events.</td>
                        <td>
                            <CustomInput
                                className="CustomInput" id="events" type="checkbox" name="events"
                                defaultChecked={emailPreferences ? emailPreferences.EVENTS : true}
                                onChange={(e: any) => setEmailPreferences(
                                    Object.assign({}, emailPreferences, {EVENTS: emailPreferences ? !emailPreferences.EVENTS : true})
                                )}
                            />
                        </td>
                    </tr>
                </tbody>
            </Table>
        </FormGroup>
    </CardBody>
};
