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
import { useSetAssignment } from "../../services/setAssignment";
import { Trans, useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;
    const { openAssignModal } = useSetAssignment(assignment.gameboard);

    return <GameboardCard 
        gameboard={assignment.gameboard} 
        linkLocation={GameboardLinkLocation.Card} 
        assignment={assignment}
        usageDisplay={{type: "correctness"}} 
        openAssignModal={openAssignModal}
    >
        <Row className="w-100">
            <Col xs={12} md={6}>
                {isDefined(assignmentStartDate) && 
                    <p className="mb-0" data-testid={"gameboard-assigned"}>
                        <Trans
                            i18nKey="common:assignments.card.assigned"
                            components={{
                                strong: <strong />,
                            }}
                            values={{ startDate: getFriendlyDaysUntil(assignmentStartDate) }}
                        />
                    </p>
                }
                {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && isOverdue(assignment) && assignment.gameboard.percentageAttempted !== 100
                    ? <p className="mb-0"><strong className="overdue">{t("common:assignments.card.overdue")}</strong> <span className="small text-muted">{t("common:assignments.card.dueDate", { dueDate: formatDate(assignment.dueDate) })}</span></p>
                    : <>{assignment.dueDate && <p className="mb-0"><Trans
                        i18nKey="common:assignments.card.due"
                        components={{
                            strong: <strong />,
                        }}
                        values={{ dueDate: getFriendlyDaysUntil(assignment.dueDate) }}
                    /></p>}</>
                }
            </Col>
            <Col>
                {isDefined(assignment.groupName) &&
                    <p className="mb-0"><strong>{t("common:assignments.card.groupLabel")}</strong> {assignment.groupName}</p>
                }
                {isDefined(assignment.assignerSummary) &&
                    <p className="mb-0"><strong>{t("common:assignments.card.assignerLabel")}</strong> {extractTeacherName(assignment.assignerSummary)}</p>
                }
            </Col>
        </Row>
        
        {assignment.notes && <p className="mb-0"><strong>{t("common:assignments.card.notesLabel")}</strong> {assignment.notes}</p>}
    </GameboardCard>;
};

const CSAssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
    const { t } = useTranslation();
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;
    return <Row data-testid={"my-assignment"} className={"pt-3 mb-3 border-top"}>
        <Col xs={8} sm={9} md={7} lg={8}>
            <div className="h4"><Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                {isDefined(assignment.gameboard) && assignment.gameboard.title}
            </Link></div>
            {isDefined(assignmentStartDate) && <p className="mb-0" data-testid={"gameboard-assigned"}><strong>{t("common:assignments.card.assignedLabel")}</strong> {formatDate(assignmentStartDate)}</p>}
            {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && isOverdue(assignment) && assignment.gameboard.percentageAttempted !== 100
                ? <p className="mb-0"><strong className="overdue">{t("common:assignments.card.overdueLabel")}</strong> {formatDate(assignment.dueDate)}</p>
                : <>{assignment.dueDate && <p className="mb-0"><strong>{t("common:assignments.card.dueLabel")}</strong> {formatDate(assignment.dueDate)}</p>}</>
            }
            {isDefined(assignment.groupName) && <p className="mb-0"><strong>{t("common:assignments.card.groupLabel")}</strong> {assignment.groupName}</p>}
            {isDefined(assignment.assignerSummary) && <p><strong>{t("common:assignments.card.assignerLabel")}</strong> {extractTeacherName(assignment.assignerSummary)}</p>}
            {isDefined(assignment.notes) && <p><strong>{t("common:assignments.card.notesLabel")}</strong> {assignment.notes}</p>}
        </Col>
        <Col xs={4} sm={3} md={5} lg={4} >
            <Row className="justify-content-end">
                <Col md="auto" className={"text-center px-3"}>
                    {assignment.gameboard && <CSCircle percentage={assignment.gameboard.percentageAttempted} label={t("common:assignments.card.attempted")}/>}
                </Col>
                <Col md="auto" className={"text-center px-3"}>
                    {assignment.gameboard && <CSCircle percentage={assignment.gameboard.percentageCorrect} label={t("common:assignments.card.correct")}/>}
                </Col>
            </Row>
        </Col>
    </Row>;
};

const AssignmentCard = siteSpecific(PhyAssignmentCard, CSAssignmentCard);

interface AssignmentsProps {
    assignments: AssignmentDTO[];
}
export const MyAssignmentsContents = ({assignments}: AssignmentsProps) => {
    const { t } = useTranslation();
    return <>
        {assignments.map((assignment, index) => <AssignmentCard assignment={assignment} key={index} />)}
        {assignments.length === 0 &&
            <p className="text-center py-4"><strong>{t("site:assignments.emptyState")}</strong></p>
        }
    </>;
};
