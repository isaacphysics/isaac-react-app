import React, {MouseEvent, useEffect, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {loadMyAssignments, logAction} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {AssignmentDTO} from "../../../IsaacApiTypes";
import {Container, Row, Col, Nav, NavItem, NavLink, UncontrolledTooltip} from 'reactstrap';
import {orderBy} from "lodash";
import {extractTeacherName} from "../../services/role";
import {PageTitle} from "../elements/PageTitle";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const stateToProps = (state: AppState) => (state && {assignments: state.assignments});
const dispatchToProps = {loadMyAssignments, logAction};

interface MyAssignmentsPageProps {
    assignments: AssignmentDTO[] | null;
    loadMyAssignments: () => void;
    logAction: (eventDetails: any) => void;
}

function formatDate(date: number | Date) {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString();
}

const Assignments = ({assignments, showOld}: {assignments: AssignmentDTO[]; showOld?: (event: MouseEvent) => void}) => {
    const now = new Date();

    return <ShowLoading until={assignments}>
        {assignments && assignments.map((assignment, index) =>
            <React.Fragment>
                <Row key={index}>
                    <Col xs={2} md={1} className="myAssignments-percentageCompleted"><h4>{assignment.gameboard && assignment.gameboard.percentageCompleted}</h4></Col>
                    <Col xs={10} md={4}>
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
                <hr />
            </React.Fragment>
        )}
        {assignments && assignments.length === 0 && (showOld ? <p>You have <a href="#" onClick={showOld}>unfinished older assignments</a></p> : <p>There are no assignments to display.</p>)}
    </ShowLoading>;
};

function notMissing<T>(item: T | undefined): T {
    if (item === undefined) throw new Error("Missing item");
    return item;
}

const MyAssignmentsPageComponent = ({assignments, loadMyAssignments, logAction}: MyAssignmentsPageProps) => {
    useEffect(() => {loadMyAssignments();}, []);
    useEffect(() => {logAction({type: "VIEW_MY_ASSIGNMENTS"})}, []);

    const now = new Date();
    const fourWeeksAgo = new Date(now.valueOf() - (4 * 7 * 24 * 60 * 60 * 1000));
    // Midnight five days ago:
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(now.getDate() - 5);
    fiveDaysAgo.setHours(0, 0, 0, 0);

    const myAssignments: {inProgressRecent: AssignmentDTO[]; inProgressOld: AssignmentDTO[]; completed: AssignmentDTO[]} = {
        inProgressRecent: [],
        inProgressOld: [],
        completed: []
    };

    if (assignments) {
        assignments.forEach(assignment => {
            assignment.gameboard = notMissing(assignment.gameboard);
            assignment.gameboard.percentageCompleted = notMissing(assignment.gameboard.percentageCompleted);
            assignment.creationDate = notMissing(assignment.creationDate);
            if (assignment.gameboard.percentageCompleted < 100) {
                let noDueDateButRecent = !assignment.dueDate && (assignment.creationDate > fourWeeksAgo);
                let dueDateAndCurrent = assignment.dueDate && (assignment.dueDate >= fiveDaysAgo);
                if (noDueDateButRecent || dueDateAndCurrent) {
                    // Assignment either not/only just overdue, or else set within last month but no due date.
                    myAssignments.inProgressRecent.push(assignment);
                } else {
                    myAssignments.inProgressOld.push(assignment);
                }
            } else {
                myAssignments.completed.push(assignment);
            }
        });
        myAssignments.inProgressRecent = orderBy(myAssignments.inProgressRecent, ["dueDate", "creationDate"], ["asc", "desc"]);
        myAssignments.inProgressOld = orderBy(myAssignments.inProgressOld, ["dueDate", "creationDate"], ["asc", "desc"]);
        myAssignments.completed = orderBy(myAssignments.completed, ["creationDate"], ["desc"]);
    }

    const [activeTab, setActiveTab] = useState(0);

    const showOld = myAssignments.inProgressRecent.length == 0 && myAssignments.inProgressOld.length > 0 && function(event: MouseEvent) {
        setActiveTab(1);
        event.preventDefault();
    } || undefined;

    const tabs: [string, AssignmentDTO[]][] = [
        ['<span class="d-none d-md-inline">Assignments </span>To&nbsp;Do', myAssignments.inProgressRecent],
        ['Older<span class="d-none d-md-inline"> Assignments</span>', myAssignments.inProgressOld],
        ['<span class="d-none d-md-inline">Completed Assignments</span><span class="d-inline d-md-none">Done</span>', myAssignments.completed]
    ];

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My Assignments" subTitle="Keep track of your assignments"
            help={<span>Any assignments you have been set will appear here.<br />Unfinished overdue assignments will show in Assignments To Do for 5 days after they are due, after which they move to Older Assignments.</span>} />
        <Nav tabs>
            {tabs.map(([tabTitle, tabItems], mapIndex) => {
                const tabIndex = mapIndex;
                const classes = activeTab === tabIndex ? "active" : "";
                return <NavItem key={tabTitle} className="px-3">
                    <NavLink className={classes} onClick={() => setActiveTab(tabIndex)}>
                        <span dangerouslySetInnerHTML={{__html: tabTitle}} /> ({tabItems.length || 0})
                    </NavLink>
                </NavItem>;
            })}
        </Nav>
        <Row>
            <Col sm="12">
                <Assignments assignments={tabs[activeTab][1]} showOld={showOld} />
            </Col>
        </Row>
    </Container>;
};

export const MyAssignments = connect(stateToProps, dispatchToProps)(MyAssignmentsPageComponent);
