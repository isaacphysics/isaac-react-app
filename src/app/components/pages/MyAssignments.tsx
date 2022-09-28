import React, {MouseEvent, useEffect, useState} from "react";
import {isaacApi, logAction, useAppDispatch} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {AssignmentDTO} from "../../../IsaacApiTypes";
import {Card, CardBody, Col, Container, Input, Label, Nav, NavItem, NavLink, Row} from 'reactstrap';
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    filterAssignmentsByProperties,
    filterAssignmentsByStatus,
    getDistinctAssignmentGroups,
    getDistinctAssignmentSetters,
    ifKeyIsEnter
} from "../../services";
import {Assignments} from "../elements/Assignments";

export const MyAssignments = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(logAction({type: "VIEW_MY_ASSIGNMENTS"}))}, [dispatch]);

    const { data: assignments } = isaacApi.endpoints.getMyAssignments.useQuery(undefined, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    const myAssignments = filterAssignmentsByStatus(assignments);

    const [activeTab, setActiveTab] = useState(0);
    const [assignmentTitleFilter, setAssignmentTitleFilter] = useState<string>("");
    const [assignmentSetByFilter, setAssignmentSetByFilter] = useState<string>("All");
    const [assignmentGroupFilter, setAssignmentGroupFilter] = useState<string>("All");

    const showOld = myAssignments.inProgressRecent.length == 0 && myAssignments.inProgressOld.length > 0 && function(event: MouseEvent) {
        setActiveTab(1);
        event.preventDefault();
    } || undefined;

    const tabs: [React.ReactElement, AssignmentDTO[], string][] = [
        [<span key={1}><span className="d-none d-md-inline">Assignments </span>To&nbsp;Do</span>, myAssignments.inProgressRecent, "Assignments To Do"],
        [<span key={2}>Older<span className="d-none d-md-inline"> Assignments</span></span>, myAssignments.inProgressOld, "Older Assignments"],
        [<span key={3}><span className="d-none d-md-inline">Completed Assignments</span><span className="d-inline d-md-none">Done</span></span>, myAssignments.completed, "Completed Assignments"]
    ];

    const pageHelp = <span>
        Any assignments you have been set will appear here.<br />
        Unfinished overdue assignments will show in Assignments To Do for 5 days after they are due, after which they move to Older Assignments.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My assignments" help={pageHelp} modalId="my_assignments_help" />
        <Card className="my-5">
            <CardBody className="pt-0">
                <ShowLoading until={assignments}>
                    <Nav className="mt-4 mb-3" tabs>
                        {tabs.map(([tabTitle, tabItems, tabAccessibleName], mapIndex) => {
                            const tabIndex = mapIndex;
                            const classes = activeTab === tabIndex ? "active" : "";
                            return <NavItem key={tabIndex} className="px-3">
                                <NavLink
                                    className={classes} tabIndex={0} onClick={() => setActiveTab(tabIndex)}
                                    onKeyDown={ifKeyIsEnter(() => setActiveTab(tabIndex))}
                                    title={`${tabAccessibleName} tab`}
                                >
                                    {tabTitle} ({tabItems.length || 0})
                                </NavLink>
                            </NavItem>;
                        })}
                    </Nav>
                    <Row>
                        <Col lg={4}>
                            <Label className="w-100">
                                Filter assignments <Input type="text" onChange={(e) => setAssignmentTitleFilter(e.target.value)} placeholder="Filter assignments by name"/>
                            </Label>
                        </Col>
                        <Col sm={6} lg={{size: 2, offset: 4}}>
                            <Label className="w-100">
                                Group <Input type="select" value={assignmentGroupFilter} onChange={e => setAssignmentGroupFilter(e.target.value)}>
                                {["All", ...getDistinctAssignmentGroups(assignments), ].map(group => <option key={group} value={group}>{group}</option>)}
                            </Input>
                            </Label>
                        </Col>
                        <Col sm={6} lg={2}>
                            <Label className="w-100">
                                Set by <Input type="select" value={assignmentSetByFilter} onChange={e => setAssignmentSetByFilter(e.target.value)}>
                                {["All", ...getDistinctAssignmentSetters(assignments)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                            </Input>
                            </Label>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <Assignments assignments={filterAssignmentsByProperties(tabs[activeTab][1], assignmentTitleFilter, assignmentGroupFilter, assignmentSetByFilter)} showOld={showOld} />
                        </Col>
                    </Row>
                </ShowLoading>
            </CardBody>
        </Card>
    </Container>;
};
