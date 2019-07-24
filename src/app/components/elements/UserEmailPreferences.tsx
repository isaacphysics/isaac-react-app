import {CardBody, CustomInput, FormGroup, Table} from "reactstrap";
import React, {useMemo} from "react";
import {UserEmailPreferences} from "../../../IsaacAppTypes";
import {DEFAULT_EMAIL_PREFERENCES} from "../../services/constants";

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null;
    setEmailPreferences: (e: any) => void;
    idPrefix?: string;
}

export const UserEmailPreference = ({emailPreferences, setEmailPreferences, idPrefix="my-account-"}: UserEmailPreferencesProps) => {
    const emailPreferencesToSet = Object.assign(DEFAULT_EMAIL_PREFERENCES, emailPreferences);

    return <CardBody>
        <p>Tell us which emails you would like to receive. These settings can be changed at any time.</p>
        <FormGroup>
            <Table>
                <thead>
                    <tr><th>Email Type</th><th>Description</th><th>Preference</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>News and Updates</td>
                        <td>New content and website feature updates, as well as interesting news about Isaac.</td>
                        <td>
                            <CustomInput
                                id={`${idPrefix}news`} type="checkbox" name="news" color="$secondary"
                                checked={emailPreferencesToSet.NEWS_AND_UPDATES}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailPreferences(
                                    Object.assign(emailPreferencesToSet, {NEWS_AND_UPDATES: e.target.checked}))
                                }
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Assignments</td>
                        <td>Get notified when your teacher gives your group a new assignment.</td>
                        <td>
                            <CustomInput
                                id={`${idPrefix}assignments`} type="checkbox" name="assignments"
                                checked={emailPreferencesToSet.ASSIGNMENTS}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailPreferences(
                                    Object.assign(emailPreferencesToSet, {ASSIGNMENTS: e.target.checked})
                                )}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Events</td>
                        <td>Information about our computer science events.</td>
                        <td>
                            <CustomInput
                                id={`${idPrefix}events`} className="CustomInput" type="checkbox" name="events"
                                checked={emailPreferencesToSet.EVENTS}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailPreferences(
                                    Object.assign(emailPreferencesToSet, {EVENTS: e.target.checked})
                                )}
                            />
                        </td>
                    </tr>
                </tbody>
            </Table>
        </FormGroup>
    </CardBody>
};
