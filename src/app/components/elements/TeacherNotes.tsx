import React, { useState } from "react";
import { Markup } from "./markup";
import { selectors, useAppSelector } from "../../state";
import { isTeacherOrAbove } from "../../services";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

interface TeacherNotesProps {
    notes?: string;
}

export const TeacherNotes = ({ notes }: TeacherNotesProps) => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.loggedInOrNull);
    const [active, setActive] = useState(false);
    if (!user || !isTeacherOrAbove(user)) return null;
    // there is an argument for using CSS details[open] to toggle the icon over state, but as is this prevents complicating icon animation logic
    return notes && <details className="teacher-notes" onToggle={() => setActive(a => !a)}>
        <summary>
            {t("common:teacherNotes.label")}
            <i className={classNames("icon icon-chevron-right icon-color-black ms-2 icon-dropdown-90", {"active": active})} />
        </summary>
        <div>
            <h4>{t("common:teacherNotes.label")}</h4>            
            <Markup trusted-markup-encoding="markdown">{notes}</Markup>
        </div>
    </details>;
};
