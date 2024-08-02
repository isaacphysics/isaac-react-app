import {AssignmentDTO} from "../../../IsaacApiTypes";
import React, {useMemo, useState} from "react";
import {Button, Col, Collapse, Label, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {
    determineGameboardStagesAndDifficulties,
    determineGameboardSubjects,
    difficultyShortLabelMap,
    extractTeacherName,
    generateGameboardSubjectHexagons,
    isDefined,
    PATHS,
    siteSpecific,
    stageLabelMap,
    TAG_ID,
    tags
} from "../../services";
import {formatDate} from "./DateString";
import {Circle} from "./svg/Circle";

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

    const topics = tags.getTopicTags(Array.from((assignment.gameboard?.contents || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.title).sort();
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;

    return <>
        <hr />
        <Row className="board-card" data-testid="my-assignment">
            <Col xs={8} sm={10} md={8}>
                <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                    <h4 className="text-break">{isDefined(assignment.gameboard) && assignment.gameboard.title}</h4>
                </Link>
                {isDefined(assignmentStartDate) &&
                <p className="mb-0" data-testid={"gameboard-assigned"}><strong>Assigned:</strong> {formatDate(assignmentStartDate)}</p>
                }
                {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && now > midnightOf(assignment.dueDate) && assignment.gameboard.percentageAttempted !== 100
                    ? <p className="mb-0"><strong className="overdue">Overdue:</strong> {formatDate(assignment.dueDate)}</p>
                    : <>{assignment.dueDate && <p className="mb-0"><strong>Due:</strong> {formatDate(assignment.dueDate)}</p>}</>
                }
                {isDefined(assignment.groupName) &&
                <p className="mb-0"><strong>Group:</strong> {assignment.groupName}</p>
                }
                {isDefined(assignment.assignerSummary) &&
                <p className="mb-0"><strong>By:</strong> {extractTeacherName(assignment.assignerSummary)}</p>
                }
                {isDefined(assignment.notes) && <p className="mb-0"><strong>Notes:</strong> {assignment.notes}</p>}
                <Button className="my-2 btn-underline" color="link" onClick={() => setShowMore(!showMore)}>
                    {showMore ? "Show less" : "Show more"}
                </Button>
            </Col>

            <Col xs={4} sm={2} md={4}>
                <Row className="justify-content-end me-0 me-md-1">
                    <Col md="auto">
                        <Label className="d-block w-100 text-center text-nowrap">
                            Attempted
                            <div className="d-flex w-100 justify-content-center board-subject-hexagon-size">
                                <div className="board-subject-hexagon-container justify-content-center">
                                    {isDefined(assignment.gameboard) && ((assignment.gameboard.percentageAttempted === 100) ?
                                        <span className="board-subject-hexagon subject-complete"/> :
                                        <>
                                            {generateGameboardSubjectHexagons(determineGameboardSubjects(assignment.gameboard))}
                                            <div className="board-percent-completed">{assignment.gameboard.percentageAttempted ?? 0}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Label>
                    </Col>
                    <Col md="auto">
                        <Label className="d-block w-100 text-center text-nowrap">
                            Correct
                            <div className="d-flex w-100 justify-content-center board-subject-hexagon-size">
                                <div className="board-subject-hexagon-container justify-content-center">
                                    {isDefined(assignment.gameboard) && ((assignment.gameboard.percentageCorrect === 100) ?
                                        <span className="board-subject-hexagon subject-complete"/> :
                                        <>
                                            {generateGameboardSubjectHexagons(determineGameboardSubjects(assignment.gameboard))}
                                            <div className="board-percent-completed">{assignment.gameboard.percentageCorrect ?? 0}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Label>
                    </Col>
                </Row>
            </Col>
        </Row>
        <Collapse isOpen={showMore} className="w-100">
            <Row>
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
    </>;
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
            <p className="text-center py-4"><strong>There are no {siteSpecific("assignments", "quizzes")} to display.</strong></p>
        }
    </>;
};
