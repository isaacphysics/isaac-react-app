import {CardBody, FormGroup} from "reactstrap";
import React from "react";
import * as RS from "reactstrap";

interface UserEmailPreferencesProps {
    anonymiseUsersChecked: boolean;
    setAnonymiseUsersChecked: (e: boolean) => void;
    idPrefix?: string;
}
export const UserAdminPreferences = ({anonymiseUsersChecked, setAnonymiseUsersChecked, idPrefix="my-account-"}: UserEmailPreferencesProps) => {

    return <CardBody className="pb-0">
        <p>Configure features only available to staff.</p>
        <FormGroup className="overflow-auto">
            <RS.CustomInput
                type="checkbox" id={`${idPrefix}-anonymise-users`}
                checked={anonymiseUsersChecked}
                onChange={(e => setAnonymiseUsersChecked(e.target.checked))}
                label="Anonymise users"
            />
        </FormGroup>
    </CardBody>
};
