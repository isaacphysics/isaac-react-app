import {AssignmentDTO} from "../../../IsaacApiTypes";
import React, {MouseEvent, useMemo} from "react";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {
    determineGameboardStagesAndDifficulties,
    difficultyShortLabelMap,
    extractTeacherName,
    isDefined,
    stageLabelMap,
    TAG_ID,
    tags,
    GAMEBOARD_SUBJECT
} from "../../services";
import {formatDate} from "./DateString";

const midnightOf = (date: Date | number) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

export const AssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
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
        <Row className="board-card" data-testid={"my-assignment"}>
            <Col xs={4} md={2} lg={1}>
                <div className="board-subject-hexagon-container">
                    {isDefined(assignment.gameboard) && ((assignment.gameboard.percentageCompleted === 100) ?
                            <span className="board-subject-hexagon subject-complete"/> :
                            <>
                                <div className="board-subject-hexagon"/>
                                <div className="board-percent-completed">{assignment.gameboard.percentageCompleted}</div>
                            </>
                    )}
                </div>
            </Col>
            <Col xs={8} md={3} lg={4} className="pl-lg-5">
                <Link to={`/gameboards#${assignment.gameboardId}`}>
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
            <Col xs={7} md={5} className="mt-sm-2">
                <p className="mb-0"><strong>Questions:</strong> {assignment.gameboard?.contents?.length || "0"}</p>
                {isDefined(topics) && topics.length > 0 && <p className="mb-0">
                    <strong>{topics.length === 1 ? "Topic" : "Topics"}:</strong>{" "}
                    {topics.join(", ")}
                </p>}
                {boardStagesAndDifficulties.length > 0 && <div className="mb-0">
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
                </div>}
                {isDefined(assignment.notes) && <p><strong>Notes:</strong> {assignment.notes}</p>}
            </Col>
            <Col xs={5} md={2} className="mt-sm-2 text-right">
                <Link to={`/gameboards#${assignment.gameboardId}`}>
                    View Assignment
                </Link>
                {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && now > midnightOf(assignment.dueDate) && assignment.gameboard.percentageCompleted !== 100 &&
                <p><strong className="overdue">Overdue:</strong> {formatDate(assignment.dueDate)}</p>}
            </Col>
        </Row>
    </>
}

interface AssignmentsProps {
    assignments: AssignmentDTO[];
    showOld?: (event: MouseEvent) => void;
}
export const Assignments = ({assignments, showOld}: AssignmentsProps) => {
    return <>
        {assignments.map((assignment, index) => <AssignmentCard assignment={assignment} key={index}/>)}
        {assignments.length === 0 &&
            (showOld
                    ? <p className="text-center py-4"><strong>You have <a href="#" onClick={showOld}>unfinished older
                        assignments</a></strong></p>
                    : <p className="text-center py-4"><strong>There are no assignments to display.</strong></p>
            )
        }
    </>;
};
