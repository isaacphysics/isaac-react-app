import React, {useEffect, useState} from "react";
import {logAction, useAppDispatch, useGetMyAssignmentsQuery} from "../../state";
import {AssignmentDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {Button, Card, CardBody, Col, Container, Input, Label, Row} from 'reactstrap';
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
import { MainContent, MyAssignmentsSidebar, SidebarLayout } from "../elements/layout/SidebarLayout";
import { MyAssignmentsOrder } from "../../../IsaacAppTypes";
import sortBy from "lodash/sortBy";
import { PageMetadata } from "../elements/PageMetadata";


const INITIAL_NO_ASSIGNMENTS = 10;
const NO_ASSIGNMENTS_INCREMENT = 10;
export enum AssignmentState {
    ALL = "All",
    TODO_RECENT = "To do (recent)",
    TODO_OLDER = "To do (older)",
    ALL_ATTEMPTED = "All attempted",
    ALL_CORRECT = "All correct"
}

const PhyMyAssignments = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(logAction({type: "VIEW_MY_ASSIGNMENTS"}));}, [dispatch]);

    // TODO don't refetch "my assignments" every component mount, an instead invalidate cache when actions occur
    //  that require refetching.
    const assignmentQuery = useGetMyAssignmentsQuery(undefined, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});

    const [assignmentStateFilter, setAssignmentStateFilter] = useState<AssignmentState[]>([AssignmentState.ALL]);
    const [assignmentTitleFilter, setAssignmentTitleFilter] = useState<string>("");
    const [assignmentSetByFilter, setAssignmentSetByFilter] = useState<string>("All");
    const [assignmentGroupFilter, setAssignmentGroupFilter] = useState<string>("All");
    const [sortOrder, setSortOrder] = useState<MyAssignmentsOrder>(MyAssignmentsOrder["-startDate"]);

    const [limit, setLimit] = useState(INITIAL_NO_ASSIGNMENTS);

    const SORT_FUNCTIONS = {
        [MyAssignmentsOrder.startDate]: (a: AssignmentDTO) => a.scheduledStartDate ? a.scheduledStartDate : a.creationDate,
        [MyAssignmentsOrder.dueDate]: (a: AssignmentDTO) => a.dueDate,
        [MyAssignmentsOrder.attempted]: (a: AssignmentDTO) => a.gameboard?.percentageAttempted ?? 0,
        [MyAssignmentsOrder.correct]: (a: AssignmentDTO) => a.gameboard?.percentageCorrect ?? 0,
    };

    const pageHelp = <span>
        Any {siteSpecific("assignments", "quizzes")} you have been set will appear here.<br />
        Overdue {siteSpecific("assignments", "quizzes")} which have not been fully attempted will be treated as {siteSpecific("assignments", "quizzes")} <strong>To do</strong> until they are due,
        after which they are considered <strong>Older</strong> {siteSpecific("assignments", "quizzes")}.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My assignments" icon={{type: "hex", icon: "icon-question-deck"}} help={pageHelp} />
        <SidebarLayout>
            <MyAssignmentsSidebar
                statusFilter={assignmentStateFilter} setStatusFilter={setAssignmentStateFilter}
                titleFilter={assignmentTitleFilter} setTitleFilter={setAssignmentTitleFilter}
                groupFilter={assignmentGroupFilter} setGroupFilter={setAssignmentGroupFilter}
                setByFilter={assignmentSetByFilter} setSetByFilter={setAssignmentSetByFilter}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
                assignmentQuery={assignmentQuery} hideButton
            />
            <MainContent>
                <PageMetadata noTitle showSidebarButton helpModalId="help_modal_my_assignments">
                    <PageFragment fragmentId={`${siteSpecific("help_toptext_assignments", "assignments_help")}_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={<div className={"mt-7"}/>} />
                </PageMetadata>
                <ShowLoadingQuery
                    query={assignmentQuery}
                    defaultErrorTitle={"Error fetching your assignments"}
                    thenRender={(assignments) => {
                        const myAssignments = filterAssignmentsByStatus(assignments);

                        const assignmentByStates: Record<AssignmentState, AssignmentDTO[]> = {
                            [AssignmentState.ALL]: [...myAssignments.inProgressRecent, ...myAssignments.inProgressOld, ...myAssignments.allAttempted, ...myAssignments.allCorrect],
                            [AssignmentState.TODO_RECENT]: myAssignments.inProgressRecent,
                            [AssignmentState.TODO_OLDER]: myAssignments.inProgressOld,
                            [AssignmentState.ALL_ATTEMPTED]: myAssignments.allAttempted,
                            [AssignmentState.ALL_CORRECT]: myAssignments.allCorrect
                        };

                        const filteredAssignments = filterAssignmentsByProperties(
                            assignmentStateFilter.includes(AssignmentState.ALL) ? assignmentByStates[AssignmentState.ALL] : assignmentStateFilter.flatMap(f => assignmentByStates[f]),
                            assignmentTitleFilter, assignmentGroupFilter, assignmentSetByFilter
                        );

                        const orderNegative = sortOrder.at(0) == "-";
                        const orderKind = (orderNegative ? sortOrder.slice(1) : sortOrder) as "startDate" | "dueDate" | "attempted" | "correct";
                        const orderedAssignments = sortBy(filteredAssignments, SORT_FUNCTIONS[orderKind]);
                        if (orderNegative) orderedAssignments.reverse();

                        return <div className="pt-4">
                            <Assignments assignments={orderedAssignments.slice(0, limit)} />
                            {limit < orderedAssignments.length && <div className="text-center">
                                <hr className="text-center" />
                                <p className="mt-4">
                                    Showing <strong>{limit}</strong> of <strong>{orderedAssignments.length}</strong> filtered {siteSpecific("assignments", "quizzes")}.
                                </p>
                                <Button color="solid" className="mb-2" onClick={_event => setLimit(limit + NO_ASSIGNMENTS_INCREMENT)}>
                                    Show more
                                </Button>
                            </div>}
                        </div>;
                    }}
                />
            </MainContent>
        </SidebarLayout>
    </Container>;
};

const AdaMyAssignments = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(logAction({type: "VIEW_MY_ASSIGNMENTS"}));}, [dispatch]);

    // TODO don't refetch "my assignments" every component mount, an instead invalidate cache when actions occur
    //  that require refetching.
    const assignmentQuery = useGetMyAssignmentsQuery(undefined, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});

    const [assignmentStateFilter, setAssignmentStateFilter] = useState<AssignmentState>(AssignmentState.ALL);
    const [assignmentTitleFilter, setAssignmentTitleFilter] = useState<string>("");
    const [assignmentSetByFilter, setAssignmentSetByFilter] = useState<string>("All");
    const [assignmentGroupFilter, setAssignmentGroupFilter] = useState<string>("All");

    const [limit, setLimit] = useState(INITIAL_NO_ASSIGNMENTS);

    const pageHelp = <span>
        Any {siteSpecific("assignments", "quizzes")} you have been set will appear here.<br />
        Overdue {siteSpecific("assignments", "quizzes")} which have not been fully attempted will be treated as {siteSpecific("assignments", "quizzes")} <strong>To do</strong> until they are due,
        after which they are considered <strong>Older</strong> {siteSpecific("assignments", "quizzes")}.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My assignments" help={pageHelp} />
        <PageFragment fragmentId={`${siteSpecific("help_toptext_assignments", "assignments_help")}_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={<div className={"mt-7"}/>} />
        <Card className={siteSpecific("my-7", "my-assignments-card")}>
            <CardBody className="pt-2">
                <ShowLoadingQuery
                    query={assignmentQuery}
                    defaultErrorTitle={"Error fetching your assignments"}
                    thenRender={(assignments) => {
                        const myAssignments = filterAssignmentsByStatus(assignments);

                        const assignmentByStates: Record<AssignmentState, AssignmentDTO[]> = {
                            [AssignmentState.ALL]: [...myAssignments.inProgressRecent, ...myAssignments.inProgressOld, ...myAssignments.allAttempted, ...myAssignments.allCorrect],
                            [AssignmentState.TODO_RECENT]: myAssignments.inProgressRecent,
                            [AssignmentState.TODO_OLDER]: myAssignments.inProgressOld,
                            [AssignmentState.ALL_ATTEMPTED]: myAssignments.allAttempted,
                            [AssignmentState.ALL_CORRECT]: myAssignments.allCorrect
                        };

                        const filteredAssignments = filterAssignmentsByProperties(assignmentByStates[assignmentStateFilter], assignmentTitleFilter, assignmentGroupFilter, assignmentSetByFilter);

                        return <>
                            <Row className="pt-2">
                                <Col md={4} lg={2}>
                                    <Label className="w-100">
                                        Status
                                        <Input type="select" data-testid="assignment-type-filter" value={assignmentStateFilter} onChange={e => setAssignmentStateFilter(e.target.value as AssignmentState)}>
                                            {Object.values(AssignmentState).map(state => <option key={state} value={state}>{state}</option>)}
                                        </Input>
                                    </Label>
                                </Col>
                                <Col md={8} lg={5}>
                                    <Label className="w-100">
                                        {siteSpecific("Filter assignments", "Filter quizzes by name")} <Input type="text" onChange={(e) => setAssignmentTitleFilter(e.target.value)} placeholder={siteSpecific("Filter assignments by name", undefined)}/>
                                    </Label>
                                </Col>
                                <Col sm={6} lg={{size: 2, offset: 1}}>
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
                            <Row className="mt-3">
                                <Col sm="12">
                                    <Assignments assignments={filteredAssignments.slice(0, limit)} />
                                </Col>
                            </Row>
                            {limit < filteredAssignments.length && <div className="text-center">
                                <hr className="text-center" />
                                <p className="mt-4">
                                    Showing <strong>{limit}</strong> of <strong>{filteredAssignments.length}</strong> filtered {siteSpecific("assignments", "quizzes")}.
                                </p>
                                <Button color="solid" className="mb-2" onClick={_event => setLimit(limit + NO_ASSIGNMENTS_INCREMENT)}>
                                    Show more
                                </Button>
                            </div>}
                        </>;
                    }}
                />
            </CardBody>
        </Card>
    </Container>;
};

export const MyAssignments = siteSpecific(PhyMyAssignments, AdaMyAssignments);
