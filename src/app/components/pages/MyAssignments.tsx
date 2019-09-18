import React, {MouseEvent, useEffect, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {loadMyAssignments, logAction} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {AssignmentDTO} from "../../../IsaacApiTypes";
import {Card, CardBody, Container, Row, Col, Nav, NavItem, NavLink} from 'reactstrap';
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {extractTeacherName} from "../../services/user";
import {DATE_FORMATTER, STUDENTS_CRUMB} from "../../services/constants";
import {filterAssignmentsByStatus} from "../../services/assignments";

const stateToProps = (state: AppState) => (state && {assignments: state.assignments});
const dispatchToProps = {loadMyAssignments, logAction};

interface MyAssignmentsPageProps {
    assignments: AssignmentDTO[] | null;
    loadMyAssignments: () => void;
    logAction: (eventDetails: object) => void;
}

function formatDate(date: number | Date) {
    const dateObject = new Date(date);
    return DATE_FORMATTER.format(dateObject);
}

const Assignments = ({assignments, showOld}: {assignments: AssignmentDTO[]; showOld?: (event: MouseEvent) => void}) => {
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



const MyAssignmentsPageComponent = ({assignments, loadMyAssignments, logAction}: MyAssignmentsPageProps) => {
    useEffect(() => {loadMyAssignments();}, []);
    useEffect(() => {logAction({type: "VIEW_MY_ASSIGNMENTS"})}, []);

    const myAssignments = filterAssignmentsByStatus(assignments)

    const [activeTab, setActiveTab] = useState(0);

    const keyPressTabToggle = (tab: number) => (event: React.KeyboardEvent) => {
        if (event.keyCode === 13) {
            setActiveTab(tab);
        }
    };

    const showOld = myAssignments.inProgressRecent.length == 0 && myAssignments.inProgressOld.length > 0 && function(event: MouseEvent) {
        setActiveTab(1);
        event.preventDefault();
    } || undefined;

    const tabs: [React.ReactElement, AssignmentDTO[]][] = [
        [<span key={1}><span className="d-none d-md-inline">Assignments </span>To&nbsp;Do</span>, myAssignments.inProgressRecent],
        [<span key={2}>Older<span className="d-none d-md-inline"> Assignments</span></span>, myAssignments.inProgressOld],
        [<span key={3}><span className="d-none d-md-inline">Completed Assignments</span><span className="d-inline d-md-none">Done</span></span>, myAssignments.completed]
    ];

    const pageHelp = <span>
        Any assignments you have been set will appear here.<br />
        Unfinished overdue assignments will show in Assignments To Do for 5 days after they are due, after which they move to Older Assignments.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My assignments" intermediateCrumbs={[STUDENTS_CRUMB]} help={pageHelp} />
        <Card className="my-5">
            <CardBody className="pt-0">
                <ShowLoading until={assignments}>
                    <Nav className="mt-4 mb-3" tabs>
                        {tabs.map(([tabTitle, tabItems], mapIndex) => {
                            const tabIndex = mapIndex;
                            const classes = activeTab === tabIndex ? "active" : "";
                            return <NavItem key={tabIndex} className="px-3">
                                <NavLink
                                    className={classes} tabIndex={0}
                                    onClick={() => setActiveTab(tabIndex)} onKeyDown={keyPressTabToggle(tabIndex)}
                                >
                                    {tabTitle} ({tabItems.length || 0})
                                </NavLink>
                            </NavItem>;
                        })}
                    </Nav>
                    <Row>
                        <Col sm="12">
                            <Assignments assignments={tabs[activeTab][1]} showOld={showOld} />
                        </Col>
                    </Row>
                </ShowLoading>
            </CardBody>
        </Card>
    </Container>;
};

export const MyAssignments = connect(stateToProps, dispatchToProps)(MyAssignmentsPageComponent);
