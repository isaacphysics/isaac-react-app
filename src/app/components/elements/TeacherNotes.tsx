import React from "react";
import { Markup } from "./markup";
import { selectors, useAppSelector } from "../../state";
import { isTeacherOrAbove } from "../../services";

interface TeacherNotesProps {
    notes?: string;
}

export const TeacherNotes = ({ notes }: TeacherNotesProps) => {
    const user = useAppSelector(selectors.user.loggedInOrNull);
    if (!user || !isTeacherOrAbove(user)) return null;
    return notes && <details className="teacher-notes">
        <summary>Teacher notes</summary>
        <div>
            <h4>Teacher notes</h4>            
            <Markup trusted-markup-encoding="markdown">{notes}</Markup>
        </div>
    </details>;
};
