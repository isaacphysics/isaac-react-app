import {siteSpecific, TEACHER_REQUEST_ROUTE, UserFacingRole} from "../../services";
import {Link} from "react-router-dom";
import React from "react";
import {UserRole} from "../../../IsaacApiTypes";


export const AccountTypeMessage = ({role}: { role?: UserRole }) => {
    return <div>
        Account type: <b>{role && UserFacingRole[role]}</b> {role == "STUDENT" &&
        siteSpecific(
            <span>
                    <small>(Are you a teacher or tutor? {" "}
                        <Link to={TEACHER_REQUEST_ROUTE} target="_blank">
                            Upgrade your account
                        </Link>{".)"}
                    </small>
            </span>,
            <span>
                    <p className="font-style-italic">Are you a teacher or tutor? {" "}
                        <Link to={TEACHER_REQUEST_ROUTE} target="_blank">
                            Upgrade your account
                        </Link>{"."}
                    </p>
            </span>
        )
    }
    </div>
}