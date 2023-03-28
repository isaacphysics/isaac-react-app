import React, {MouseEvent, useEffect, useState} from "react";
import {isaacApi, logAction, useAppDispatch} from "../../state";
import {AssignmentDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {Card, CardBody, Col, Container, Input, Label, Nav, NavItem, NavLink, Row} from 'reactstrap';
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    filterAssignmentsByProperties,
    filterAssignmentsByStatus,
    getDistinctAssignmentGroups,
    getDistinctAssignmentSetters,
    ifKeyIsEnter, isAda, isTutorOrAbove,
    siteSpecific
} from "../../services";
import {Assignments} from "../elements/Assignments";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import classNames from "classnames";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";

export const MyAssignments = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(logAction({type: "VIEW_MY_ASSIGNMENTS"}))}, [dispatch]);

    // TODO don't refetch "my assignments" every component mount, an instead invalidate cache when actions occur
    //  that require refetching.
    const assignmentQuery = isaacApi.endpoints.getMyAssignments.useQuery(undefined, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});

    const [activeTab, setActiveTab] = useState(0);
    const [assignmentTitleFilter, setAssignmentTitleFilter] = useState<string>("");
    const [assignmentSetByFilter, setAssignmentSetByFilter] = useState<string>("All");
    const [assignmentGroupFilter, setAssignmentGroupFilter] = useState<string>("All");

    const pageHelp = <span>
        Any {siteSpecific("assignments", "quizzes")} you have been set will appear here.<br />
        Unfinished overdue {siteSpecific("assignments", "quizzes")} will show in {siteSpecific("Assignments", "Quizzes")} To Do for 5 days after they are due, after which they move to Older {siteSpecific("Assignments", "Quizzes")}.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My assignments" help={pageHelp} modalId="my_assignments_help" />
        {isAda && <PageFragment fragmentId={`assignments_help_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={<div className={"mt-5"}/>} />}
        <Card className={siteSpecific("my-5", "my-assignments-card")}>
            <CardBody className={siteSpecific("pt-0", "pt-2")}>
                <ShowLoadingQuery
                    query={assignmentQuery}
                    defaultErrorTitle={"Error fetching your assignments"}
                    thenRender={(assignments) => {
                        const myAssignments = filterAssignmentsByStatus(assignments);

                        const showOld = myAssignments.inProgressRecent.length == 0 && myAssignments.inProgressOld.length > 0 && function(event: MouseEvent) {
                            setActiveTab(1);
                            event.preventDefault();
                        } || undefined;

                        const lowerCaseAssignmentNounPlural = siteSpecific("Assignments", "quizzes");
                        const tabs: [React.ReactElement, AssignmentDTO[], string][] = [
                            [<span key={1}><span className="d-none d-md-inline">{siteSpecific("Assignments", "Quizzes")} </span>To&nbsp;Do</span>, myAssignments.inProgressRecent, `${siteSpecific("Assignments", "Quizzes")} To Do`],
                            [<span key={2}>Older<span className="d-none d-md-inline"> {lowerCaseAssignmentNounPlural}</span></span>, myAssignments.inProgressOld, `Older ${lowerCaseAssignmentNounPlural}`],
                            [<span key={3}><span className="d-none d-md-inline">Completed {lowerCaseAssignmentNounPlural}</span><span className="d-inline d-md-none">Done</span></span>, myAssignments.completed, `Completed ${lowerCaseAssignmentNounPlural}`]
                        ];

                        return <>
                            <Nav className="mt-4 mb-3" tabs>
                                {tabs.map(([tabTitle, tabItems, tabAccessibleName], mapIndex) => {
                                    const tabIndex = mapIndex;
                                    return <NavItem key={tabIndex} className={classNames("px-3", {"active": activeTab === tabIndex})} >
                                        <NavLink
                                            tabIndex={0} onClick={() => setActiveTab(tabIndex)}
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
                                        {siteSpecific("Filter assignments", "Filter quizzes by name")} <Input type="text" onChange={(e) => setAssignmentTitleFilter(e.target.value)} placeholder={siteSpecific("Filter assignments by name", undefined)}/>
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
                            <Row className={siteSpecific("", "mt-3")}>
                                <Col sm="12">
                                    <Assignments assignments={filterAssignmentsByProperties(tabs[activeTab][1], assignmentTitleFilter, assignmentGroupFilter, assignmentSetByFilter)} showOld={showOld} />
                                </Col>
                            </Row>
                        </>;
                    }}
                />
            </CardBody>
        </Card>
    </Container>;
};
