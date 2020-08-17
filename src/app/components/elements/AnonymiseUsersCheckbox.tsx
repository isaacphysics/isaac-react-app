import * as RS from "reactstrap";
import React, {useState} from "react";
import {KEY, load, save} from "../../services/localStorage";

interface AnonymiseUsersCheckboxProps {
    className?: string
}

export const AnonymiseUsersCheckbox = ({className}: AnonymiseUsersCheckboxProps) => {
    const [checked, setChecked] = useState<boolean>(load(KEY.ANONYMISE_USERS) == "YES");

    return <RS.CustomInput
        className={className}
        type="checkbox" id={"anonymise-users-checkbox"}
        checked={checked}
        onChange={e => {
            setChecked(e.target.checked);
            save(KEY.ANONYMISE_USERS, e.target.checked ? "YES": "NO");
            window.location.reload();
        }}
        label="Anonymise users"
    />
};
