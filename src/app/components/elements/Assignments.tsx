import {AssignmentDTO} from "../../../IsaacApiTypes";
import React, {MouseEvent} from "react";
import {ShowLoading} from "../handlers/ShowLoading";
import {Col, Row} from "reactstrap";
import {Link} from "react-router-dom";
import {extractTeacherName} from "../../services/user";
import {DATE_FORMATTER} from "../../services/constants";

function formatDate(date: number | Date) {
    const dateObject = new Date(date);
    return DATE_FORMATTER.format(dateObject);
}

interface AssignmentsProps {
    assignments: AssignmentDTO[];
    showOld?: (event: MouseEvent) => void;
}

export const Assignments = ({assignments, showOld}: AssignmentsProps) => {
    const now = new Date();

    return <ShowLoading until={assignments}>
        {assignments && assignments.map((assignment, index) =>
            <React.Fragment key={index}>
                <hr />
                <Row>
                    <Col xs={3} md={1} className="myAssignments-percentageCompleted">
                        <h4>{assignment.gameboard && assignment.gameboard.percentageCompleted}</h4>
                    </Col>
                    <Col xs={9} md={4}>
                        <Link to={`/gameboards#${assignment.gameboardId}`}>
                            <h4>{assignment.gameboard && assignment.gameboard.title}</h4>
                        </Link>
                        {assignment.creationDate &&
                        <p>Assigned: {formatDate(assignment.creationDate)}</p>
                        }
                        {assignment.dueDate &&
                        <p>Due: {formatDate(assignment.dueDate)}</p>
                        }
                        {assignment.assignerSummary &&
                        <p>By: {extractTeacherName(assignment.assignerSummary)}</p>
                        }
                    </Col>
                    <Col xs={7} md={5} className="mt-sm-2">
                        <h6>Quick view...</h6>
                        {assignment.gameboard && assignment.gameboard.questions && <ol>
                            {assignment.gameboard.questions.length > 0 && <li>{assignment.gameboard.questions[0].title}</li>}
                            {assignment.gameboard.questions.length > 1 && <li>{assignment.gameboard.questions[1].title}</li>}
                            {assignment.gameboard.questions.length > 2 && <li>{assignment.gameboard.questions[2].title}</li>}
                        </ol>}
                    </Col>
                    <Col xs={5} md={2} className="mt-sm-2 text-right">
                        <Link to={`/gameboards#${assignment.gameboardId}`}>
                            View Assignment
                        </Link>
                        {assignment.dueDate && assignment.gameboard && now > assignment.dueDate && assignment.gameboard.percentageCompleted != 100 &&
                        <p><strong className="overdue">Overdue:</strong> {formatDate(assignment.dueDate)}</p>}
                    </Col>
                </Row>
            </React.Fragment>
        )}
        {assignments && assignments.length === 0 &&
        (showOld ?
            <p className="text-center py-4"><strong>You have <a href="#" onClick={showOld}>unfinished older assignments</a></strong></p> :
            <p className="text-center py-4"><strong>There are no assignments to display.</strong></p>
        )}
    </ShowLoading>;
};