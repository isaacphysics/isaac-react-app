import React from "react";
import { Markup } from "./markup";

interface TeacherNotesProps {
    notes?: string;
}

export const TeacherNotes = ({ notes }: TeacherNotesProps) => {
    return notes && <details className="teacher-notes">
        <summary>Teacher notes</summary>
        <div>
            <h4>Teacher notes</h4>            
            <Markup trusted-markup-encoding="markdown">{notes}</Markup>
        </div>
    </details>;
};
