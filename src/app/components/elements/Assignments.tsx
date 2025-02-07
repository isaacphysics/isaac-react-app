import {AssignmentDTO} from "../../../IsaacApiTypes";
import React, {useMemo, useState} from "react";
import {Button, Col, Collapse, Label, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {
    above,
    determineGameboardStagesAndDifficulties,
    determineGameboardSubjects,
    difficultyShortLabelMap,
    extractTeacherName,
    generateGameboardSubjectHexagons,
    HUMAN_SUBJECTS,
    isDefined,
    PATHS,
    siteSpecific,
    stageLabelMap,
    Subject,
    TAG_ID,
    tags,
    useDeviceSize
} from "../../services";
import {formatDate, FRIENDLY_DATE, getFriendlyDaysUntil} from "./DateString";
import {Circle} from "./svg/Circle";
import { PhyHexIcon } from "./svg/PhyHexIcon";
import { HoverableTooltip } from "./HoverableTooltip";

const midnightOf = (date: Date | number) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

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
    const [showMore, setShowMore] = useState(false);
    const now = new Date();
    const boardStagesAndDifficulties = useMemo(() => determineGameboardStagesAndDifficulties(assignment.gameboard), [assignment.gameboard]);

    const deviceSize = useDeviceSize();

    const topics = tags.getTopicTags(Array.from((assignment.gameboard?.contents || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.title).sort();
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;

    const boardSubjects = determineGameboardSubjects(assignment.gameboard);

    return <Link className="w-100 assignments-card px-3 py-2 mb-3" to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
        <Row data-testid="my-assignment">
            <Col xs={8}>
                <div className="d-flex align-items-center">
                    <div className="d-flex justify-content-center board-subject-hexagon-size me-4 my-2">
                        <div className="board-subject-hexagon-container justify-content-center">
                            {generateGameboardSubjectHexagons(boardSubjects)}
                        </div>
                        <PhyHexIcon icon="page-icon-question-pack" subject={boardSubjects[0] as Subject} className="assignment-hex ps-3"/>
                    </div>
                    <div className="d-flex flex-column flex-grow-1">
                        <h4 className="text-break m-0">{isDefined(assignment.gameboard) && assignment.gameboard.title}</h4>
                        {above['sm'](deviceSize) && boardSubjects.length > 0 && <div className="d-flex align-items-center mb-2">
                            {boardSubjects.map((subject) => <span key={subject} className="badge rounded-pill bg-theme me-1" data-bs-theme={subject}>{HUMAN_SUBJECTS[subject]}</span>)}
                        </div>}
                    </div>
                </div>

                <Row>
                    <Col>
                        {isDefined(assignmentStartDate) && 
                            <p className="mb-0" data-testid={"gameboard-assigned"}>
                                Assigned{" "}
                                { getFriendlyDaysUntil(assignmentStartDate).startsWith("on ")
                                    ? <strong>{getFriendlyDaysUntil(assignmentStartDate)}</strong>
                                    : <HoverableTooltip tooltip={formatDate(assignmentStartDate, FRIENDLY_DATE)}>
                                        <strong>{getFriendlyDaysUntil(assignmentStartDate)}</strong>
                                    </HoverableTooltip>
                                }
                            </p>
                        }
                        {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && now > midnightOf(assignment.dueDate) && assignment.gameboard.percentageAttempted !== 100
                            ? <p className="mb-0"><strong className="overdue">Overdue</strong> <span className="small text-muted">(due {formatDate(assignment.dueDate)})</span></p>
                            : <>{assignment.dueDate && <p className="mb-0">Due <strong>{getFriendlyDaysUntil(assignment.dueDate)}</strong></p>}</>
                        }
                    </Col>
                    {above['md'](deviceSize) && <Col>
                        {isDefined(assignment.groupName) &&
                            <p className="mb-0"><strong>Group:</strong> {assignment.groupName}</p>
                        }
                        {isDefined(assignment.assignerSummary) &&
                            <p className="mb-0"><strong>By:</strong> {extractTeacherName(assignment.assignerSummary)}</p>
                        }
                    </Col>}
                </Row>
                
                {assignment.notes && <p className="mb-0"><strong>Notes:</strong> {assignment.notes}</p>}
                <Button className="my-2 btn-underline" color="link" onClick={(e) => {e.preventDefault(); setShowMore(!showMore);}}>
                    {showMore ? "Hide details" : "Show details"}
                </Button>
            </Col>

            <Col xs={4}>
                <div className="d-flex flex-wrap justify-content-center justify-content-md-end justify-content-lg-center justify-content-xl-end column-gap-4">
                    <Label className="d-block w-max-content text-center text-nowrap pt-3">
                        {isDefined(assignment.gameboard) && ((assignment.gameboard.percentageAttempted === 100) ?
                            <span className="board-subject-hexagon subject-complete"/> :
                            <div className="board-percent-completed">{assignment.gameboard.percentageAttempted ?? 0}</div>
                        )}
                        Attempted
                    </Label>
                    <Label className="d-block w-max-content text-center text-nowrap pt-3">
                        {isDefined(assignment.gameboard) && ((assignment.gameboard.percentageCorrect === 100) ?
                            <span className="board-subject-hexagon subject-complete"/> :
                            <div className="board-percent-completed">{assignment.gameboard.percentageCorrect ?? 0}</div>
                        )}
                        Correct
                    </Label>
                </div>
            </Col>
        </Row>
        <Collapse isOpen={showMore} className="w-100">
            <Row>
                {!above['md'](deviceSize) && <Col xs={12}>
                    {isDefined(assignment.groupName) &&
                        <p className="mb-0"><strong>Group:</strong> {assignment.groupName}</p>
                    }
                    {isDefined(assignment.assignerSummary) &&
                        <p className="mb-0"><strong>By:</strong> {extractTeacherName(assignment.assignerSummary)}</p>
                    }
                </Col>}

                <Col xs={12} md={8} className="mt-sm-2">
                    <p className="mb-0"><strong>Questions:</strong> {assignment.gameboard?.contents?.length || "0"}</p>
                    {isDefined(topics) && topics.length > 0 && <p className="mb-0">
                        <strong>{topics.length === 1 ? "Topic" : "Topics"}:</strong>{" "}
                        {topics.join(", ")}
                    </p>}
                </Col>
                <Col xs={12} md={4} className="mt-sm-2">
                    {boardStagesAndDifficulties.length > 0 && <p className="mb-0">
                        <table className="w-100">
                            <thead>
                                <tr>
                                    <th className="w-50">
                                        {`Stage${boardStagesAndDifficulties.length > 1 ? "s" : ""}:`}
                                    </th>
                                    <th className="w-50">
                                        {`Difficult${boardStagesAndDifficulties.some(([, ds]) => ds.length > 1) ? "ies" : "y"}`}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {boardStagesAndDifficulties.map(([stage, difficulties]) => <tr key={stage}>
                                    <td className="w-50 align-baseline">
                                        {stageLabelMap[stage]}:
                                    </td>
                                    <td className="w-50 ps-1">
                                        {difficulties.map((d) => difficultyShortLabelMap[d]).join(", ")}
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </p>}
                </Col>
            </Row>
        </Collapse>
    </Link>;
};

const CSAssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
    const now = new Date();
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;
    return <Row data-testid={"my-assignment"} className={"pt-3 mb-3 border-top"}>
        <Col xs={8} sm={9} md={7} lg={8}>
            <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                <h4>{isDefined(assignment.gameboard) && assignment.gameboard.title}</h4>
            </Link>
            {isDefined(assignmentStartDate) && <p className="mb-0" data-testid={"gameboard-assigned"}><strong>Assigned:</strong> {formatDate(assignmentStartDate)}</p>}
            {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && now > midnightOf(assignment.dueDate) && assignment.gameboard.percentageAttempted !== 100
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
