import React from "react";
import {KEY, persistence} from "../../services";
import { Input } from "reactstrap";

interface AnonymisationCheckboxesProps {
    className?: string
}

export const AnonymisationCheckboxes = ({className}: AnonymisationCheckboxesProps) => {
    return <div className={className}>
        <Input
            type="checkbox" id={"anonymise-users-checkbox"}
            checked={persistence.load(KEY.ANONYMISE_USERS) === "YES"}
            onChange={e => {
                persistence.save(KEY.ANONYMISE_USERS, e.target.checked ? "YES": "NO");
                if (!e.target.checked) {
                    persistence.save(KEY.ANONYMISE_GROUPS, "NO");
                }
                window.location.reload();
            }}
            label="Disguise only user names and emails in teacher tools"
        />
        <Input
            type="checkbox" id={"anonymise-groups-checkbox"}
            checked={persistence.load(KEY.ANONYMISE_GROUPS) === "YES"}
            onChange={e => {
                persistence.save(KEY.ANONYMISE_GROUPS, e.target.checked ? "YES": "NO");
                if (e.target.checked) {
                    persistence.save(KEY.ANONYMISE_USERS, "YES");
                }
                window.location.reload();
            }}
            label="Disguise both user and group details in teacher tools"
        />
    </div>
};
