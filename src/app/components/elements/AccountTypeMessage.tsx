import {siteSpecific, TEACHER_REQUEST_ROUTE} from "../../services";
import {Link} from "react-router-dom";
import React from "react";
import {UserRole} from "../../../IsaacApiTypes";

const UserFacingRoleWithArticle: {[role in UserRole]: string} = {
    ADMIN: "an admin",
    EVENT_MANAGER: "an event manager",
    CONTENT_EDITOR: "a content editor",
    EVENT_LEADER: "an event leader",
    TEACHER: "a teacher",
    TUTOR: "a tutor",
    STUDENT: "a student"
};

export const AccountTypeMessage = ({role, hideUpgradeMessage}: { role?: UserRole, hideUpgradeMessage?: boolean }) => {
    if (!role) return null;

    const [indefiniteArticle, ...roleSplit] = UserFacingRoleWithArticle[role].split(" ");
    const userFacingRole = roleSplit.join(" ");

    return <div>
        You have {indefiniteArticle} <strong>{userFacingRole}</strong> account.
        {role === "STUDENT" && !hideUpgradeMessage &&
        <span> If you are a teacher{siteSpecific(" or tutor", "")}, you can {" "}
            {siteSpecific(
                <Link to={TEACHER_REQUEST_ROUTE} target="_blank">upgrade your account</Link>,
                <strong><Link to={TEACHER_REQUEST_ROUTE} target="_blank">upgrade your account</Link></strong>
            )}
            {"."}
        </span>
        }
    </div>;
};
