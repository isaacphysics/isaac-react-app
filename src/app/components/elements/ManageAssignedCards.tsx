import React from "react";
import { Row, Col } from "reactstrap";
import { AssignmentDTO, QuizAssignmentDTO } from "../../../IsaacApiTypes";
import { isDefined, isOverdue, useManageQuizAssignments } from "../../services";
import { useManageAssignment } from "../../services/setAssignment";
import { GameboardCard, GameboardLinkLocation } from "./cards/GameboardCard";
import { getFriendlyDaysUntil } from "./DateString";
import { TestCard } from "./cards/TestCard";

// this is similar to MyAssignmentsContents/AssignmentCard, but:
// - GameboardCard.usageDisplay is undefined, so no completion / group statistics are shown in the top right.
// - inside the card's children, does not highlight past deadlines.
// - GameboardCard.allowManaging is set
export const ManageAssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;

    const { openAssignModal, unassign } = useManageAssignment(assignment);

    return <GameboardCard 
        className="mt-2"
        gameboard={assignment.gameboard}
        linkLocation={GameboardLinkLocation.Title}
        assignment={assignment}
        openAssignModal={openAssignModal}
        usageDisplay={{type: "progressLink", assignment}}
        unassign={unassign}
        allowManaging
    >
        <Row className="w-100">
            <Col>
                {isDefined(assignment.groupName) &&
                    <p className="mb-0">Set to <strong>{assignment.groupName}</strong></p>
                }
                {isDefined(assignmentStartDate) && 
                    <p className="mb-0" data-testid={"gameboard-assigned"}>
                        Assigned <strong>{getFriendlyDaysUntil(assignmentStartDate)}</strong>
                    </p>
                }
                {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && <p className="mb-0">
                    Due <strong>{getFriendlyDaysUntil(assignment.dueDate)}</strong>
                    {isOverdue(assignment) && <span className="overdue ms-1">(passed)</span>}
                </p>}
            </Col>
        </Row>
        
        {assignment.notes && <p className="mb-0"><strong>Notes:</strong> {assignment.notes}</p>}
    </GameboardCard>;
};

export const ManageTestCard = ({quizAssignment}: {quizAssignment: QuizAssignmentDTO}) => {

    const { cancel, openExtendDueDateModal, openAssignModal, openSetFeedbackModeModal } = useManageQuizAssignments();

    return <TestCard
        className="mt-2"
        quizAssignment={quizAssignment}
        linkLocation={!isOverdue(quizAssignment) ? GameboardLinkLocation.Title : undefined}
        usageDisplay={{type: "progressLink"}}
        openAssignModal={() => openAssignModal(quizAssignment)}
        cancel={() => cancel(quizAssignment)} 
        openSetFeedbackModeModal={() => openSetFeedbackModeModal(quizAssignment)}
        extendDueDate={() => openExtendDueDateModal(quizAssignment)}
        allowManaging
    >
        <Row className="w-100">
            <Col>
                {/* // TODO groupName is not defined anywhere in the quiz summary – can we add this in the API? */}
                {/* {isDefined(quizAssignment.quizSummary?.groupName) &&
                    <p className="mb-0">Set to <strong>{quizAssignment.quizSummary?.groupName}</strong></p>
                } */}
                {isDefined(quizAssignment?.scheduledStartDate) || isDefined(quizAssignment?.creationDate) &&
                    <p className="mb-0" data-testid={"gameboard-assigned"}>
                        Assigned <strong>{getFriendlyDaysUntil(quizAssignment.scheduledStartDate || quizAssignment.creationDate)}</strong>
                    </p>
                }
                {isDefined(quizAssignment?.dueDate) && <p className="mb-0">
                    Due <strong>{getFriendlyDaysUntil(quizAssignment.dueDate)}</strong>
                    {isOverdue(quizAssignment) && <span className="overdue ms-1">(passed)</span>}
                </p>}
            </Col>
        </Row>
    </TestCard>;
};
