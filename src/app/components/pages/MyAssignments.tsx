import React, {useEffect, useState} from "react";
import {logAction, useAppDispatch, useGetMyAssignmentsQuery} from "../../state";
import {AssignmentDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {Button, Col, Input, Label, Row} from 'reactstrap';
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {filterAssignmentsByProperties, filterAssignmentsByStatus, getDistinctAssignmentGroups, getDistinctAssignmentSetters, isAda, isPhy, isTutorOrAbove, siteSpecific} from "../../services";
import {Assignments} from "../elements/Assignments";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {PageFragment} from "../elements/PageFragment";
import { MyAssignmentsOrder } from "../../../IsaacAppTypes";
import sortBy from "lodash/sortBy";
import { PageMetadata } from "../elements/PageMetadata";
import classNames from "classnames";
import { PageContainer } from "../elements/layout/PageContainer";
import { MyAssignmentsSidebar } from "../elements/sidebar/MyAssignmentsSidebar";
import { MyAdaSidebar } from "../elements/sidebar/MyAdaSidebar";

const INITIAL_NO_ASSIGNMENTS = 10;
const NO_ASSIGNMENTS_INCREMENT = 10;
export enum AssignmentState {
    ALL = "All",
    TODO = "To do",
    OVERDUE = "Overdue",
    ALL_ATTEMPTED = "All attempted",
    ALL_CORRECT = "All correct"
}

interface AdaAssignmentProps {
    assignments: AssignmentDTO[];
    limit: number;
    filteredAssignments: AssignmentDTO[];
    statusFilter: AssignmentState[];
    groupFilter: string;
    setByFilter: string;
    setStatusFilter: (state: AssignmentState[]) => void;
    setTitleFilter: (title: string) => void;
    setGroupFilter: (group: string) => void;
    setSetByFilter: (setBy: string) => void;
}

const AdaAssignmentView = (props: AdaAssignmentProps) => {
    const {filteredAssignments, assignments, statusFilter, groupFilter, setByFilter, setStatusFilter, setTitleFilter, setGroupFilter, setSetByFilter, limit} = props;

    return <>
        <Row className="pt-2">
            <Col md={4} lg={2}>
                <Label className="w-100">
                    Status
                    <Input type="select" data-testid="assignment-type-filter" value={statusFilter[0]} onChange={e => setStatusFilter([e.target.value as AssignmentState])}>
                        {Object.values(AssignmentState).map(state => <option key={state} value={state}>{state}</option>)}
                    </Input>
                </Label>
            </Col>
            <Col md={8} lg={5}>
                <Label className="w-100">
                    Filter quizzes by name 
                    <Input type="text" onChange={(e) => setTitleFilter(e.target.value)} placeholder="Search"/>
                </Label>
            </Col>
            <Col sm={6} lg={{size: 2, offset: 1}}>
                <Label className="w-100">
                    Group
                    <Input type="select" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
                        {["All", ...getDistinctAssignmentGroups(assignments)].map(group => <option key={group} value={group}>{group}</option>)}
                    </Input>
                </Label>
            </Col>
            <Col sm={6} lg={2}>
                <Label className="w-100">
                    Set by
                    <Input type="select" value={setByFilter} onChange={e => setSetByFilter(e.target.value)}>
                        {["All", ...getDistinctAssignmentSetters(assignments)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                    </Input>
                </Label>
            </Col>
        </Row>
        <Row className="mt-3">
            <Assignments assignments={filteredAssignments.slice(0, limit)} />
        </Row>
    </>;
};

export const MyAssignments = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(logAction({type: "VIEW_MY_ASSIGNMENTS"}));}, [dispatch]);

    // TODO don't refetch "my assignments" every component mount, an instead invalidate cache when actions occur
    // that require refetching.
    const assignmentQuery = useGetMyAssignmentsQuery(undefined, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});

    const [statusFilter, setStatusFilter] = useState<AssignmentState[]>(siteSpecific([AssignmentState.TODO], [AssignmentState.ALL]));
    const [titleFilter, setTitleFilter] = useState<string>("");
    const [groupFilter, setGroupFilter] = useState<string>("All");
    const [setByFilter, setSetByFilter] = useState<string>("All");
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [sortOrder, setSortOrder] = useState<MyAssignmentsOrder>(MyAssignmentsOrder["-startDate"]);

    const [limit, setLimit] = useState(INITIAL_NO_ASSIGNMENTS);

    const pageHelp = <span>
        Any quizzes you have been set will appear here.<br />
        Overdue quizzes which have not been fully attempted will be treated as quizzes <strong>To do</strong> until they are due,
        after which they are considered <strong>Older</strong> quizzes.
    </span>;

    const myAssignmentOptionProps = {
        statusFilter, titleFilter, groupFilter, setByFilter,
        setStatusFilter, setTitleFilter, setGroupFilter, setSetByFilter
    };

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle="My assignments" icon={{type: "icon", icon: "icon-question-deck"}} help={pageHelp}/>
        }
        sidebar={siteSpecific(
            <MyAssignmentsSidebar
                {...myAssignmentOptionProps}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
                assignmentQuery={assignmentQuery} hideButton
            />,
            <MyAdaSidebar />
        )}
    >
        <PageMetadata noTitle showSidebarButton helpModalId="help_modal_my_assignments">
            <PageFragment fragmentId={siteSpecific(
                isTutorOrAbove(user) ? "help_toptext_assignments_teacher" : "help_toptext_assignments_student",
                isTutorOrAbove(user) ? "assignments_help_teacher" : "assignments_help_student"
            )} ifNotFound={<div className="mt-7"/>} />
        </PageMetadata>
        <div className={classNames({"my-assignments-card card": isAda})}>
            <div className={classNames({"pt-2 card-body": isAda})}>
                <ShowLoadingQuery
                    query={assignmentQuery}
                    defaultErrorTitle={"Error fetching your assignments"}
                    thenRender={(assignments) => 
                    {
                        const myAssignments = filterAssignmentsByStatus(assignments);

                        const SORT_FUNCTIONS = {
                            [MyAssignmentsOrder.startDate]: (a: AssignmentDTO) => a.scheduledStartDate ? a.scheduledStartDate : a.creationDate,
                            [MyAssignmentsOrder.dueDate]: (a: AssignmentDTO) => a.dueDate,
                            [MyAssignmentsOrder.attempted]: (a: AssignmentDTO) => a.gameboard?.percentageAttempted ?? 0,
                            [MyAssignmentsOrder.correct]: (a: AssignmentDTO) => a.gameboard?.percentageCorrect ?? 0,
                        };

                        const assignmentByStates: Record<AssignmentState, AssignmentDTO[]> = {
                            [AssignmentState.ALL]: [...myAssignments.inProgress, ...myAssignments.overDue, ...myAssignments.allAttempted, ...myAssignments.allCorrect],
                            [AssignmentState.TODO]: myAssignments.inProgress,
                            [AssignmentState.OVERDUE]: myAssignments.overDue,
                            [AssignmentState.ALL_ATTEMPTED]: myAssignments.allAttempted,
                            [AssignmentState.ALL_CORRECT]: myAssignments.allCorrect
                        };

                        const filteredAssignments = filterAssignmentsByProperties(
                            statusFilter.includes(AssignmentState.ALL) ? assignmentByStates[AssignmentState.ALL] : statusFilter.flatMap(f => assignmentByStates[f]),
                            titleFilter, groupFilter, setByFilter
                        );

                        if (isPhy && isFirstLoad && filteredAssignments.length === 0) {
                            setStatusFilter([AssignmentState.ALL]);
                        }
                        setIsFirstLoad(false);

                        const orderNegative = sortOrder.at(0) == "-";
                        const orderKind = (orderNegative ? sortOrder.slice(1) : sortOrder) as "startDate" | "dueDate" | "attempted" | "correct";
                        const orderedAssignments = sortBy(filteredAssignments, SORT_FUNCTIONS[orderKind]);
                        if (orderNegative) orderedAssignments.reverse();
                        
                        return <>
                            {siteSpecific(
                                <div className="pt-4">
                                    <Assignments assignments={orderedAssignments.slice(0, limit)} />
                                </div>, 
                                <AdaAssignmentView
                                    {...myAssignmentOptionProps}
                                    assignments={assignments}
                                    filteredAssignments={filteredAssignments}
                                    limit={limit}
                                />
                            )}
                            {limit < filteredAssignments.length && <div className="text-center">
                                <hr className="text-center" />
                                <p className="mt-4">
                                    Showing <strong>{limit}</strong> of <strong>{filteredAssignments.length}</strong> filtered quizzes.
                                </p>
                                <Button color="solid" className="mb-2" onClick={_event => setLimit(limit + NO_ASSIGNMENTS_INCREMENT)}>
                                    Show more
                                </Button>
                            </div>} 
                        </>;
                    }}
                />
            </div>
        </div>
    </PageContainer>;
};
