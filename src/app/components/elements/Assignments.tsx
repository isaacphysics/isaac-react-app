import {AssignmentDTO, Difficulty, Stage} from "../../../IsaacApiTypes";
import React, {MouseEvent} from "react";
import {ShowLoading} from "../handlers/ShowLoading";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {extractTeacherName} from "../../services/user";
import {formatDate} from "./DateString";
import {
    allPropertiesFromAGameboard,
    determineGameboardSubjects,
    generateGameboardSubjectHexagons
} from "../../services/gameboards";
import {isDefined} from "../../services/miscUtils";
import tags from "../../services/tags";
import {difficultiesOrdered, stageLabelMap, stagesOrdered, TAG_ID} from "../../services/constants";
import {AggregateDifficultyIcons} from "./svg/DifficultyIcons";

interface AssignmentsProps {
    assignments: AssignmentDTO[];
    showOld?: (event: MouseEvent) => void;
}

const midnightOf = (date: Date | number) => {
    let d = new Date(date);
    d.setHours(11, 59, 59, 999);
    return d;
};

export const Assignments = ({assignments, showOld}: AssignmentsProps) => {
    const now = new Date();

    return <ShowLoading until={assignments}>
        {isDefined(assignments) && assignments.map((assignment, index) => {
            const stages = allPropertiesFromAGameboard(assignment.gameboard, "stage", stagesOrdered);
            const difficulties = allPropertiesFromAGameboard(assignment.gameboard, "difficulty", difficultiesOrdered);
            const topics = tags.getTopicTags(Array.from((assignment.gameboard?.contents || []).reduce((a, c) => {
                if (isDefined(c.tags) && c.tags.length > 0) {
                    return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
                }
                return a;
            }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.title).sort();
            return <React.Fragment key={index}>
                <hr />
                <Row className="board-card">
                    <Col xs={4} md={2} lg={1}>
                        <div className="board-subject-hexagon-container">
                            {isDefined(assignment.gameboard) && ((assignment.gameboard.percentageCompleted === 100) ?
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
                            <h4>{isDefined(assignment.gameboard) && assignment.gameboard.title}</h4>
                        </Link>
                        {isDefined(assignment.creationDate) &&
                        <p className="mb-0"><strong>Assigned:</strong> {formatDate(assignment.creationDate)}</p>
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
                        {stages.length > 0 && <p className="mb-0">
                            <strong>{stages.length === 1 ? "Stage" : "Stages"}:</strong>{" "}
                            {stages.map(s => stageLabelMap[s]).join(", ")}
                        </p>}
                        {difficulties.length > 0 && <p className="mb-0">
                            <strong>{difficulties.length === 1 ? "Difficulty" : "Difficulties"}:</strong>{" "}
                            <div className="d-inline-flex">
                                {<AggregateDifficultyIcons difficulties={difficulties} />}
                            </div>
                        </p>}
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
            </React.Fragment>
        })}
        {isDefined(assignments) && assignments.length === 0 &&
        (showOld ?
            <p className="text-center py-4"><strong>You have <a href="#" onClick={showOld}>unfinished older assignments</a></strong></p> :
            <p className="text-center py-4"><strong>There are no assignments to display.</strong></p>
        )}
    </ShowLoading>;
};
