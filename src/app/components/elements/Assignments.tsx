import {AssignmentDTO} from "../../../IsaacApiTypes";
import React, {MouseEvent, useMemo, useState} from "react";
import {Button, Col, Collapse, Label, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {
    determineGameboardPercentageAttempted,
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

const CSCircle = ({assignment}: {assignment: AssignmentDTO}) => {
    if (!isDefined(assignment.gameboard)) return null;
    return <svg className={"board-circle"} width={48} height={48}>
        <Circle radius={24} properties={{fill: "#000"}}/>
        <foreignObject className={"board-percent-completed"} x={0} y={0} width={48} height={48}>
            {assignment.gameboard.percentageCompleted}%
        </foreignObject>
    </svg>;
};

const PhyAssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
    const [showMore, setShowMore] = useState(false);
    const now = new Date();
    const boardStagesAndDifficulties = useMemo(() => determineGameboardStagesAndDifficulties(assignment.gameboard), [assignment.gameboard]);
    const boardPercentageAttempted = useMemo(() => determineGameboardPercentageAttempted(assignment.gameboard), [assignment.gameboard]);

    const topics = tags.getTopicTags(Array.from((assignment.gameboard?.contents || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.title).sort();
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;

    return <>
        <hr />
        <Row className="board-card" data-testid={"my-assignment"}>
            <Col xs={9} md={8} className="pl-lg-5">
                <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                    <h4>{isDefined(assignment.gameboard) && assignment.gameboard.title}</h4>
                </Link>
                {isDefined(assignmentStartDate) &&
                <p className="mb-0" data-testid={"gameboard-assigned"}><strong>Assigned:</strong> {formatDate(assignmentStartDate)}</p>
                }
                {isDefined(assignment.dueDate) &&
                <p className="mb-0"><strong>Due:</strong> {formatDate(assignment.dueDate)}</p>
                }
                {isDefined(assignment.groupName) &&
                <p className="mb-0"><strong>Group:</strong> {assignment.groupName}</p>
                }
                {isDefined(assignment.assignerSummary) &&
                <p><strong>By:</strong> {extractTeacherName(assignment.assignerSummary)}</p>
                }
            </Col>

            <Col xs={3} md={2}>
                <Label className="text-center">
                    %&nbsp;Attempted
                    <div className="d-flex justify-content-center">
                        <div className="board-subject-hexagon-container">
                            {isDefined(assignment.gameboard) && ((boardPercentageAttempted === 100) ?
                                <span className="board-subject-hexagon subject-complete"/> :
                                <>
                                    {generateGameboardSubjectHexagons(determineGameboardSubjects(assignment.gameboard))}
                                    <div className="board-percent-completed">{boardPercentageAttempted}</div>
                                </>
                            )}
                        </div>
                    </div>
                </Label>
            </Col>

            <Col className="d-none d-md-block" md={2}>
                <Label className="text-center">
                    %&nbsp;Correct
                    <div className="d-flex justify-content-center">
                        <div className="board-subject-hexagon-container">
                            {isDefined(assignment.gameboard) && ((assignment.gameboard.percentageCompleted === 100) ?
                                <span className="board-subject-hexagon subject-complete"/> :
                                <>
                                    {generateGameboardSubjectHexagons(determineGameboardSubjects(assignment.gameboard))}
                                    <div className="board-percent-completed">{assignment.gameboard.percentageCompleted}</div>
                                </>
                            )}
                        </div>
                    </div>
                </Label>
            </Col>
        </Row>
        <Row>
            <Button className="ml-3" color="link" onClick={() => setShowMore(!showMore)}>
                {showMore ? "Show less" : "Show more"}
            </Button>

            <Col xs={5} md={2} className="mt-sm-2 text-right">
                <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                    View Assignment
                </Link>
                {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && now > midnightOf(assignment.dueDate) && assignment.gameboard.percentageCompleted !== 100 &&
                <p><strong className="overdue">Overdue:</strong> {formatDate(assignment.dueDate)}</p>}
            </Col>

            <Collapse isOpen={showMore} className="w-100">
                <Col xs={7} md={5} className="mt-sm-2">
                    <p className="mb-0"><strong>Questions:</strong> {assignment.gameboard?.contents?.length || "0"}</p>
                    {isDefined(topics) && topics.length > 0 && <p className="mb-0">
                        <strong>{topics.length === 1 ? "Topic" : "Topics"}:</strong>{" "}
                        {topics.join(", ")}
                    </p>}
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
                                <td className="w-50 pl-1">
                                    {difficulties.map((d) => difficultyShortLabelMap[d]).join(", ")}
                                </td>
                            </tr>)}
                            </tbody>
                        </table>
                    </p>}
                    {isDefined(assignment.notes) && <p><strong>Notes:</strong> {assignment.notes}</p>}
                </Col>
            </Collapse>
        </Row>
    </>
};

const CSAssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
    const now = new Date();
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;
    return <Row data-testid={"my-assignment"} className={"pt-3 mb-3 border-top"}>
        <Col xs={2} lg={1} className={"text-center px-3 pt-3"}>
            <CSCircle assignment={assignment}/>
        </Col>
        <Col xs={10} md={4}>
            <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                <h4>{isDefined(assignment.gameboard) && assignment.gameboard.title}</h4>
            </Link>
            {isDefined(assignment.groupName) && <p className="mb-0"><strong>Group:</strong> {assignment.groupName}</p>}
            {isDefined(assignment.assignerSummary) && <p><strong>By:</strong> {extractTeacherName(assignment.assignerSummary)}</p>}
        </Col>
        <Col xs={6} md={4}>
            {isDefined(assignmentStartDate) && <p className="mb-0" data-testid={"gameboard-assigned"}><strong>Assigned:</strong> {formatDate(assignmentStartDate)}</p>}
            {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && now > midnightOf(assignment.dueDate) && assignment.gameboard.percentageCompleted !== 100
                ? <p><strong className="overdue">Overdue:</strong> {formatDate(assignment.dueDate)}</p>
                : <p className="mb-0"><strong>Due:</strong> {formatDate(assignment.dueDate)}</p>
            }
            {isDefined(assignment.notes) && <p><strong>Notes:</strong> {assignment.notes}</p>}
            <Button className={"text-nowrap mt-2 d-none d-md-block d-lg-none"} size={"sm"} outline tag={Link} to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                View quiz
            </Button>
        </Col>
        <Col className={"ml-auto text-right d-lg-block d-md-none d-block"}>
            <Button className={"text-nowrap vertical-center-transform"} size={"sm"} outline tag={Link} to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`}>
                View quiz
            </Button>
        </Col>
    </Row>;
};

const AssignmentCard = siteSpecific(PhyAssignmentCard, CSAssignmentCard);

interface AssignmentsProps {
    assignments: AssignmentDTO[];
    showOld?: (event: MouseEvent) => void;
}
export const Assignments = ({assignments, showOld}: AssignmentsProps) => {
    return <>
        {assignments.map((assignment, index) => <AssignmentCard assignment={assignment} key={index}/>)}
        {assignments.length === 0 &&
            (showOld
                ? <p className="text-center py-4"><strong>You have <a href="#" onClick={showOld}>unfinished older {siteSpecific("assignments", "quizzes")}</a></strong></p>
                : <p className="text-center py-4"><strong>There are no {siteSpecific("assignments", "quizzes")} to display.</strong></p>
            )
        }
    </>;
};
