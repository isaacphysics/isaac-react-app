import {siteSpecific, TEACHER_REQUEST_ROUTE, UserFacingRole} from "../../services";
import {Link} from "react-router-dom";
import React from "react";
import {UserRole} from "../../../IsaacApiTypes";


export const AccountTypeMessage = ({role, hideUpgradeMessage}: { role?: UserRole, hideUpgradeMessage?: boolean }) => {
    return <div>
    {role && <>
        You have a <strong>{UserFacingRole[role]}</strong> account.
        {role === "STUDENT" && !hideUpgradeMessage &&
            <span> If you are a teacher{siteSpecific(" or tutor", "")}, you can {" "}
                {siteSpecific(
                    <Link to={TEACHER_REQUEST_ROUTE} target="_blank">upgrade your account</Link>,
                    <strong><Link to={TEACHER_REQUEST_ROUTE} target="_blank">upgrade your account</Link></strong>
                )}
                {"."}
            </span>
        }
    </>
    }
    </div>;
};
