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
import {ifKeyIsEnter} from "../../services/navigation";
import {Assignments} from "../elements/Assignments";

const stateToProps = (state: AppState) => (state && {assignments: state.assignments});
const dispatchToProps = {loadMyAssignments, logAction};

interface MyAssignmentsPageProps {
    assignments: AssignmentDTO[] | null;
    loadMyAssignments: () => void;
    logAction: (eventDetails: object) => void;
}

const MyAssignmentsPageComponent = ({assignments, loadMyAssignments, logAction}: MyAssignmentsPageProps) => {
    useEffect(() => {loadMyAssignments();}, []);
    useEffect(() => {logAction({type: "VIEW_MY_ASSIGNMENTS"})}, []);

    const myAssignments = filterAssignmentsByStatus(assignments);

    const [activeTab, setActiveTab] = useState(0);

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
                                    className={classes} tabIndex={0} onClick={() => setActiveTab(tabIndex)}
                                    onKeyDown={ifKeyIsEnter(() => setActiveTab(tabIndex))}
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
