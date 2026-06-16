import React, { useState } from "react";
import { Markup } from "./markup";
import { selectors, useAppSelector } from "../../state";
import { isTeacherOrAbove } from "../../services";
import classNames from "classnames";

interface TeacherNotesProps {
    notes?: string;
}

export const TeacherNotes = ({ notes }: TeacherNotesProps) => {
    const user = useAppSelector(selectors.user.loggedInOrNull);
    const [active, setActive] = useState(false);
    if (!user || !isTeacherOrAbove(user)) return null;
    // there is an argument for using CSS details[open] to toggle the icon over state, but as is this prevents complicating icon animation logic
    return notes && <details className="teacher-notes" onToggle={() => setActive(a => !a)}>
        <summary>
            Teacher notes
            <i className={classNames("icon icon-chevron-right icon-color-black ms-2 icon-dropdown-90", {"active": active})} />
        </summary>
        <div>
            <h4>Teacher notes</h4>            
            <Markup trusted-markup-encoding="markdown">{notes}</Markup>
        </div>
    </details>;
};
