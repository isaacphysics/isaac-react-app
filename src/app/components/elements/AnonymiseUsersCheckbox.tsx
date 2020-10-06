import * as RS from "reactstrap";
import React from "react";
import {KEY, load, save} from "../../services/localStorage";

interface AnonymiseUsersCheckboxProps {
    className?: string
}

export const AnonymiseUsersCheckbox = ({className}: AnonymiseUsersCheckboxProps) => {
    return <RS.CustomInput
        className={className}
        type="checkbox" id={"anonymise-users-checkbox"}
        checked={load(KEY.ANONYMISE_USERS) === "YES"}
        onChange={e => {
            save(KEY.ANONYMISE_USERS, e.target.checked ? "YES": "NO");
            window.location.reload();
        }}
        label="Disguise user and group names in teacher tools"
    />
};
