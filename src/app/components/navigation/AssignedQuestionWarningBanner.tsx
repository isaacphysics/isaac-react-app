import React from "react";
import { AssignmentDTO, QuestionDTO } from "../../../IsaacApiTypes";
import { extractTeacherName, getAssignmentsToDo, isDefined } from "../../services";
import { Alert } from "reactstrap";
import { Link } from "react-router";
import { useGetMyAssignmentsQuery } from "../../state";
import { skipToken } from "@reduxjs/toolkit/query";

interface AccessingAssignedQuestionOutsideAssignmentWarningProps {
    question?: QuestionDTO;
    assignment?: AssignmentDTO;
}

export const AccessingAssignedQuestionOutsideAssignmentWarning = ({question, assignment}: AccessingAssignedQuestionOutsideAssignmentWarningProps) => {

    // don't bother loading if we're in an assignment – this warning won't show
    const {data: assignments} = useGetMyAssignmentsQuery(assignment?.id ? skipToken : undefined);
    const assignmentsToDo = getAssignmentsToDo(assignments);

    // if we are not currently on an assignment...
    if (!isDefined(assignment) && isDefined(question)) {
        // but this question exists on an active assignment...
        const activeAssignmentsWithQuestion = assignmentsToDo?.filter(a => a.gameboard?.contents?.map(c => c.id).includes(question.id));
        if (activeAssignmentsWithQuestion?.length) {
            // warn
            return <Alert color="warning" className="mb-4">
                <span>This question has been set to you as part of an active assignment. Answering it here will <strong>not</strong> count towards the assignment.</span>

                <ul className="mt-3">
                    {activeAssignmentsWithQuestion.map((a) => <li key={a.id}>
                        <Link to={`/assignment/${a.id}/view`}><b>{a.gameboard?.title}</b></Link>
                        {" "}(set to <b>{a.groupName}</b> by {extractTeacherName(a.assignerSummary)})
                    </li>)}
                </ul>
            </Alert>;
        }
    }

    return null;
};
