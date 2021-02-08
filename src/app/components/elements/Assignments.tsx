import {AssignmentDTO} from "../../../IsaacApiTypes";
import React, {MouseEvent} from "react";
import {ShowLoading} from "../handlers/ShowLoading";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {extractTeacherName} from "../../services/user";
import {formatDate} from "./DateString";
import {determineGameboardSubjects, generateGameboardSubjectHexagons} from "../../services/gameboards";
import { isDefined } from "../../services/miscUtils";
import tags from "../../services/tags";
import { TAG_ID } from "../../services/constants";
import {selectors} from "../../state/selectors";
import { useSelector } from "react-redux";

interface AssignmentsProps {
    assignments: AssignmentDTO[];
    showOld?: (event: MouseEvent) => void;
}

export const Assignments = ({assignments, showOld}: AssignmentsProps) => {
    const now = new Date();

    return <ShowLoading until={assignments}>
        {assignments && assignments.map((assignment, index) => {
            const levels = Array.from((assignment.gameboard?.questions || []).reduce((a, c) => {
                if (isDefined(c.level)) {
                    a.add(c.level);
                }
                return a;
            }, new Set<number>())).sort();
            const topics = Array.from((assignment.gameboard?.questions || []).reduce((a, c) => {
                if (isDefined(c.tags) && c.tags.length > 0) {
                    return new Set([...Array.from(a), ...c.tags.map(id => tags.getById(id as TAG_ID)?.title)])
                }
                return a;
            }, new Set<string>())).filter(tag => isDefined(tag)).sort();
            return <React.Fragment key={index}>
                <hr />
                <Row className="board-card">
                    <Col xs={4} md={2} lg={1}>
                        <div className="board-subject-hexagon-container">
                            {assignment.gameboard && ((assignment.gameboard.percentageCompleted === 100) ?
                                <span className="board-subject-hexagon subject-complete"/> :
                                <>
                                    {generateGameboardSubjectHexagons(determineGameboardSubjects(assignment.gameboard))}
                                    <div className="board-percent-completed">{assignment.gameboard.percentageCompleted}</div>
                                </>
                            )}
                        </div>
                    </Col>
                    <Col xs={8} md={3} lg={4} className="pl-lg-5">
                        <Link to={`/gameboards#${assignment.gameboardId}`}>
                            <h4>{assignment.gameboard && assignment.gameboard.title}</h4>
                        </Link>
                        {assignment.creationDate &&
                        <p className="mb-0">Assigned: {formatDate(assignment.creationDate)}</p>
                        }
                        {assignment.dueDate &&
                        <p className="mb-0">Due: {formatDate(assignment.dueDate)}</p>
                        }
                        <p className="mb-0">Group: {assignment.groupId}</p> {/* TODO: Show the group's name here */}
                        {assignment.assignerSummary &&
                        <p>By: {extractTeacherName(assignment.assignerSummary)}</p>
                        }
                    </Col>
                    <Col xs={7} md={5} className="mt-sm-2">
                        <p>Questions: {assignment.gameboard?.questions?.length || "0"}</p>
                        {levels && levels.length > 0 && <p>{levels.length === 1 ? "Level" : "Levels"}: {levels.join(", ")}</p>}
                        {topics && topics.length > 0 && <p>{topics.length === 1 ? "Topic" : "Topics"}: {topics.join(", ")}</p>}
                        {isDefined(assignment.notes) && <p>Notes: {assignment.notes}</p>}
                    </Col>
                    <Col xs={5} md={2} className="mt-sm-2 text-right">
                        <Link to={`/gameboards#${assignment.gameboardId}`}>
                            View Assignment
                        </Link>
                        {isDefined(assignment.dueDate) && assignment.gameboard && now > assignment.dueDate && assignment.gameboard.percentageCompleted !== 100 &&
                        <p><strong className="overdue">Overdue:</strong> {formatDate(assignment.dueDate)}</p>}
                    </Col>
                </Row>
            </React.Fragment>
        })}
        {assignments && assignments.length === 0 &&
        (showOld ?
            <p className="text-center py-4"><strong>You have <a href="#" onClick={showOld}>unfinished older assignments</a></strong></p> :
            <p className="text-center py-4"><strong>There are no assignments to display.</strong></p>
        )}
    </ShowLoading>;
};
