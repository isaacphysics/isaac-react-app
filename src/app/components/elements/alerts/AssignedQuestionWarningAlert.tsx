import React from "react";
import { AssignmentDTO, QuestionDTO } from "../../../../IsaacApiTypes";
import { extractTeacherName, getAssignmentsToDo, isDefined } from "../../../services";
import { Alert } from "reactstrap";
import { Link } from "react-router";
import { useGetMyAssignmentsQuery } from "../../../state";
import { skipToken } from "@reduxjs/toolkit/query";
import { FeatureFlag, useFeatureFlag } from "../../../services/featureFlag";
import { Trans } from "react-i18next";

interface AccessingAssignedQuestionOutsideAssignmentWarningProps {
    question?: QuestionDTO;
    assignment?: AssignmentDTO;
}

export const AccessingAssignedQuestionOutsideAssignmentWarning = ({question, assignment}: AccessingAssignedQuestionOutsideAssignmentWarningProps) => {

    const isAssignmentsV2 = useFeatureFlag(FeatureFlag.ASSIGNMENTS_V2);

    // don't bother loading if we're in an assignment – this warning won't show
    const {data: assignments} = useGetMyAssignmentsQuery(!isAssignmentsV2 || assignment?.id ? skipToken : undefined);
    const assignmentsToDo = getAssignmentsToDo(assignments);

    if (!isAssignmentsV2) return null;

    // if we are not currently on an assignment...
    if (!isDefined(assignment) && isDefined(question)) {
        // but this question exists on an active assignment...
        const activeAssignmentsWithQuestion = assignmentsToDo?.filter(a => a.gameboard?.contents?.map(c => c.id).includes(question.id));
        if (activeAssignmentsWithQuestion?.length) {
            // warn
            return <Alert color="warning" className="mb-4">
                <span><Trans i18nKey="common:assignments.warning.outsideAssignment" components={{ strong: <strong /> }} /></span>

                <ul className="mt-3">
                    {activeAssignmentsWithQuestion.map((a) => <li key={a.id}>
                        <Trans
                            i18nKey="common:assignments.warning.assignmentDetail"
                            components={{
                                assignmentLink: <Link to={`/assignment/${a.id}/view`} />,
                                strong: <b />,
                                bold: <b />,
                            }}
                            values={{ assignmentTitle: a.gameboard?.title, groupName: a.groupName, teacherName: extractTeacherName(a.assignerSummary) }}
                        />
                    </li>)}
                </ul>
            </Alert>;
        }
    }

    return null;
};
