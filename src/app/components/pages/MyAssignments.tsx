import React, {MouseEvent, useEffect, useState} from "react";
import {logAction, useAppDispatch, useGetMyAssignmentsQuery} from "../../state";
import {AssignmentDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {Card, CardBody, Col, Container, Input, Label, Row} from 'reactstrap';
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    filterAssignmentsByProperties,
    filterAssignmentsByStatus,
    getDistinctAssignmentGroups,
    getDistinctAssignmentSetters,
    isTutorOrAbove,
    siteSpecific
} from "../../services";
import {Assignments} from "../elements/Assignments";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {PageFragment} from "../elements/PageFragment";


const assignmentStates = ["All", "To do", "Older", "All attempted", "All correct"];
type AssignmentState = typeof assignmentStates[number];

export const MyAssignments = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(logAction({type: "VIEW_MY_ASSIGNMENTS"}))}, [dispatch]);

    // TODO don't refetch "my assignments" every component mount, an instead invalidate cache when actions occur
    //  that require refetching.
    const assignmentQuery = useGetMyAssignmentsQuery(undefined, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});

    const [assignmentStateFilter, setAssignmentStateFilter] = useState<AssignmentState>("All");
    const [assignmentTitleFilter, setAssignmentTitleFilter] = useState<string>("");
    const [assignmentSetByFilter, setAssignmentSetByFilter] = useState<string>("All");
    const [assignmentGroupFilter, setAssignmentGroupFilter] = useState<string>("All");

    const pageHelp = <span>
        Any {siteSpecific("assignments", "quizzes")} you have been set will appear here.<br />
        Unfinished overdue {siteSpecific("assignments", "quizzes")} will show in {siteSpecific("Assignments", "Quizzes")} To Do until they are due, after which they move to Older {siteSpecific("Assignments", "Quizzes")}.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My assignments" help={pageHelp} modalId="my_assignments_help" />
        <PageFragment fragmentId={`assignments_help_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={<div className={"mt-5"}/>} />
        <Card className={siteSpecific("my-4", "my-assignments-card")}>
            <CardBody className="pt-3">
                <ShowLoadingQuery<AssignmentDTO[]>
                    query={assignmentQuery}
                    defaultErrorTitle={"Error fetching your assignments"}
                    thenRender={(assignments) => {
                        const myAssignments = filterAssignmentsByStatus(assignments);

                        const assignmentByStates: Record<AssignmentState, AssignmentDTO[]> = {
                            "All": [...myAssignments.inProgressRecent, ...myAssignments.inProgressOld, ...myAssignments.allAttempted, ...myAssignments.completed],
                            "To do": myAssignments.inProgressRecent,
                            "Older": myAssignments.inProgressOld,
                            "All attempted": myAssignments.allAttempted,
                            "All correct": myAssignments.completed
                        };

                        return <>
                            <Row>
                                <Col sm="12">
                                    <Label className="w-100">
                                        Assignments by state
                                        <Input type="select" data-testid="assignment-type-filter" value={assignmentStateFilter} onChange={e => setAssignmentStateFilter(e.target.value)}>
                                            {assignmentStates.map(state => <option key={state} value={state}>{state}</option>)}
                                        </Input>
                                    </Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={4}>
                                    <Label className="w-100">
                                        {siteSpecific("Filter assignments", "Filter quizzes by name")} <Input type="text" onChange={(e) => setAssignmentTitleFilter(e.target.value)} placeholder={siteSpecific("Filter assignments by name", undefined)}/>
                                    </Label>
                                </Col>
                                <Col sm={6} lg={{size: 2, offset: 4}}>
                                    <Label className="w-100">
                                        Group
                                        <Input type="select" value={assignmentGroupFilter} onChange={e => setAssignmentGroupFilter(e.target.value)}>
                                            {["All", ...getDistinctAssignmentGroups(assignments), ].map(group => <option key={group} value={group}>{group}</option>)}
                                        </Input>
                                    </Label>
                                </Col>
                                <Col sm={6} lg={2}>
                                    <Label className="w-100">
                                        Set by
                                        <Input type="select" value={assignmentSetByFilter} onChange={e => setAssignmentSetByFilter(e.target.value)}>
                                            {["All", ...getDistinctAssignmentSetters(assignments)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                                        </Input>
                                    </Label>
                                </Col>
                            </Row>
                            <Row className={siteSpecific("", "mt-3")}>
                                <Col sm="12">
                                    <Assignments assignments={filterAssignmentsByProperties(assignmentByStates[assignmentStateFilter], assignmentTitleFilter, assignmentGroupFilter, assignmentSetByFilter)} />
                                </Col>
                            </Row>
                        </>;
                    }}
                />
            </CardBody>
        </Card>
    </Container>;
};
