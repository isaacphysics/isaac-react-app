import React from "react";
import { Markup } from "./markup";
import { selectors, useAppSelector } from "../../state";
import { isTeacherOrAbove } from "../../services";
import { useTranslation } from 'react-i18next'

interface TeacherNotesProps {
    notes?: string;
}

export const TeacherNotes = ({ notes }: TeacherNotesProps) => {
    const { t } = useTranslation()
    const user = useAppSelector(selectors.user.loggedInOrNull);
    if (!user || !isTeacherOrAbove(user)) return null;
    return notes && <details className="teacher-notes">
        <summary>{t('teacherNotes', 'Teacher notes')}</summary>
        <div>
            <h4>{t('teacherNotes', 'Teacher notes')}</h4>            
            <Markup trusted-markup-encoding="markdown">{notes}</Markup>
        </div>
    </details>;
};
