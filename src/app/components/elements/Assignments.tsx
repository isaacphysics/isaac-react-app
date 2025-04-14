import {AssignmentDTO} from "../../../IsaacApiTypes";
import React, {} from "react";
import {Col, Label, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {
    extractTeacherName,
    isDefined,
    isOverdue,
    PATHS,
    siteSpecific} from "../../services";
import {formatDate, getFriendlyDaysUntil} from "./DateString";
import {Circle} from "./svg/Circle";
import { GameboardCard, GameboardLinkLocation } from "./cards/GameboardCard";

const CSCircle = ({label, percentage}: {percentage: number | unknown, label: string}) => {
    return <Label>
        <span className="d-block">{label}</span>
        <svg className={"board-circle mt-1"} width={48} height={48}>
            <Circle radius={24} properties={{fill: "#000"}}/>
            <foreignObject className={"board-percent-completed"} x={0} y={0} width={48} height={48}>
                {`${percentage ?? 0}%`}
            </foreignObject>
        </svg>
    </Label>;
};

const PhyAssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;

    return <GameboardCard gameboard={assignment.gameboard} linkLocation={GameboardLinkLocation.Card}>
        <Row className="w-100">
            <Col xs={12} md={6}>
                {isDefined(assignmentStartDate) && 
                    <p className="mb-0" data-testid={"gameboard-assigned"}>
                        Assigned <strong>{getFriendlyDaysUntil(assignmentStartDate)}</strong>
                    </p>
                }
                {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && isOverdue(assignment) && assignment.gameboard.percentageAttempted !== 100
                    ? <p className="mb-0"><strong className="overdue">Overdue</strong> <span className="small text-muted">(due {formatDate(assignment.dueDate)})</span></p>
                    : <>{assignment.dueDate && <p className="mb-0">Due <strong>{getFriendlyDaysUntil(assignment.dueDate)}</strong></p>}</>
                }
            </Col>
            <Col>
                {isDefined(assignment.groupName) &&
                    <p className="mb-0"><strong>Group:</strong> {assignment.groupName}</p>
                }
                {isDefined(assignment.assignerSummary) &&
                    <p className="mb-0"><strong>By:</strong> {extractTeacherName(assignment.assignerSummary)}</p>
                }
            </Col>
        </Row>
        
        {assignment.notes && <p className="mb-0"><strong>Notes:</strong> {assignment.notes}</p>}
    </GameboardCard>;
};

const CSAssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;
    return <Row data-testid={"my-assignment"} className={"pt-3 mb-3 border-top"}>
        <Col xs={8} sm={9} md={7} lg={8}>
            <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                <h4>{isDefined(assignment.gameboard) && assignment.gameboard.title}</h4>
            </Link>
            {isDefined(assignmentStartDate) && <p className="mb-0" data-testid={"gameboard-assigned"}><strong>Assigned:</strong> {formatDate(assignmentStartDate)}</p>}
            {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && isOverdue(assignment) && assignment.gameboard.percentageAttempted !== 100
                ? <p className="mb-0"><strong className="overdue">Overdue:</strong> {formatDate(assignment.dueDate)}</p>
                : <>{assignment.dueDate && <p className="mb-0"><strong>Due:</strong> {formatDate(assignment.dueDate)}</p>}</>
            }
            {isDefined(assignment.groupName) && <p className="mb-0"><strong>Group:</strong> {assignment.groupName}</p>}
            {isDefined(assignment.assignerSummary) && <p><strong>By:</strong> {extractTeacherName(assignment.assignerSummary)}</p>}
            {isDefined(assignment.notes) && <p><strong>Notes:</strong> {assignment.notes}</p>}
        </Col>
        <Col xs={4} sm={3} md={5} lg={4} >
            <Row className="justify-content-end">
                <Col md="auto" className={"text-center px-3"}>
                    {assignment.gameboard && <CSCircle percentage={assignment.gameboard.percentageAttempted} label="Attempted"/>}
                </Col>
                <Col md="auto" className={"text-center px-3"}>
                    {assignment.gameboard && <CSCircle percentage={assignment.gameboard.percentageCorrect} label="Correct"/>}
                </Col>
            </Row>
        </Col>
    </Row>;
};

const AssignmentCard = siteSpecific(PhyAssignmentCard, CSAssignmentCard);

interface AssignmentsProps {
    assignments: AssignmentDTO[];
}
export const Assignments = ({assignments}: AssignmentsProps) => {
    return <>
        {assignments.map((assignment, index) => <AssignmentCard assignment={assignment} key={index}/>)}
        {assignments.length === 0 &&
            <p className="text-center py-4"><strong>There are no {siteSpecific("assignments", "quizzes")} to display for the selected filters.</strong></p>
        }
    </>;
};
