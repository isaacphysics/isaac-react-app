import {
    openActiveModal,
    useAppDispatch,
    useGetGroupsQuery,
    useGetMySetAssignmentsQuery,
    useGetQuizAssignmentsSetByMeQuery} from "../../state";
import {IAssignmentLike, QuizAssignmentDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import sortBy from "lodash/sortBy";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import React, {Fragment, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Collapse,
    Row} from "reactstrap";
import {
    getAssignmentStartDate,
    isAssignment,
    isDefined,
    isQuiz,
    Item,
    MONTH_NAMES,
    TAG_ID,
    tags,
} from "../../services";
import {
    ActiveModalProps,
    ManageAssignmentsContext,
    ValidWorkWithListingDate
} from "../../../IsaacAppTypes";
import {calculateHexagonProportions, Hexagon} from "../elements/svg/Hexagon";
import classNames from "classnames";
import {Link} from "react-router-dom";
import {combineQueries, discardResults, ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {formatDate} from "../elements/DateString";
import { PageContainer } from "../elements/layout/PageContainer";
import { ManageAssignmentsSidebar } from "../elements/sidebar/ManageAssignmentsSidebar";
import { PhyAddGameboardButtons } from "./SetAssignments";
import { PageMetadata } from "../elements/PageMetadata";
import { PageFragment } from "../elements/PageFragment";
import { RenderNothing } from "../elements/RenderNothing";
import { ManageAssignmentCard, ManageTestCard } from "../elements/ManageAssignedCards";

const isValidWork = (a: IAssignmentLike) => {
    return (isAssignment(a) && a.gameboardId) || (isQuiz(a) && a.quizId && a.quizSummary);
};

const GroupWorkList = ({groupId, work, initialOpen, parentOpen}: {groupId: number; work: ValidWorkWithListingDate[]; initialOpen?: boolean; parentOpen?: boolean}) => {
    const [open, setOpen] = useState<boolean>(!!initialOpen);
    const {collapsed, setCollapsed, groupsById} = useContext(ManageAssignmentsContext);
    const groupName = groupsById[groupId]?.groupName ?? "Unknown group";

    useEffect(() => {
        if (collapsed) setOpen(!!initialOpen);
    }, [collapsed, initialOpen]);

    useEffect(() => {
        if (!parentOpen) setOpen(!!initialOpen);
    }, [parentOpen, initialOpen]);

    return <div className={"group-assignment-list"}>
        <div 
            tabIndex={0} 
            role={"button"} 
            aria-label={(open ? "Collapse" : "Expand") + ` list for group ${groupName}`} 
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    setOpen(o => !o);
                    setCollapsed(false);
                }
            }} 
            onClick={() => {
                setOpen(o => !o);
                setCollapsed(false);
            }} 
            className={"hexagon-date"}
        >
            <div className="d-flex align-items-center gap-2 ms-5">
                <i className={classNames("icon icon-chevron-right icon-dropdown-90", {"active": open})} />
                {groupName}
            </div>
        </div>
        <Collapse isOpen={open}>
            {work.map(a => isAssignment(a as IAssignmentLike)
                ? <ManageAssignmentCard
                    key={a.id}
                    assignment={a}
                />
                : isQuiz(a as IAssignmentLike)
                    ? <ManageTestCard
                        key={a.id}
                        quizAssignment={a as QuizAssignmentDTO}
                    />
                    : null
            )}
        </Collapse>
    </div>;
};

// If the hexagon proportions change, the CSS class bg-timeline needs revisiting
const dateHexagon = calculateHexagonProportions(20, 1);

const DateWorkList = ({date, work}: {date: number; work: ValidWorkWithListingDate[]}) => {
    const [open, setOpen] = useState<boolean>(false);
    const {collapsed, setCollapsed, viewBy} = useContext(ManageAssignmentsContext);
    const assignmentCount = useMemo(() => work.filter(isAssignment).length, [work]);
    const testCount = useMemo(() => work.filter(isQuiz).length, [work]);

    const groupsAndWork = useMemo(() => {        
        return work.reduce((acc, a) => {
            const groupId = a.groupId;
            if (!groupId) return acc;
            if (!(groupId in acc)) {
                acc[groupId] = [];
            }
            acc[groupId].push(a);
            return acc;
        }, {} as {[id: number]: ValidWorkWithListingDate[]});
    }, [work]);

    const numGroups = Object.keys(groupsAndWork).length;

    useEffect(() => {
        if (collapsed) setOpen(false);
    }, [collapsed]);

    return <>
        <div tabIndex={0} role={"button"} aria-label={(open ? "Collapse" : "Expand") + ` list for day ${date}`} onKeyDown={(e) => {
            if (e.key === "Enter") {
                setOpen(o => !o);
                setCollapsed(false);
            }
        }} onClick={() => {
            setOpen(o => !o);
            setCollapsed(false);
        }} className={"hexagon-date"}>
            <div className={classNames("d-flex align-items-center gap-2", {"text-muted": !open, "fw-bold": open})}>
                <svg height={dateHexagon.quarterHeight * 4} width={dateHexagon.halfWidth * 2}>
                    <Hexagon className={"fill-secondary"} {...dateHexagon}/>
                    <foreignObject height={dateHexagon.quarterHeight * 4} width={dateHexagon.halfWidth * 2} y={2} x={0}>
                        <div className={"position-relative w-100"}>
                            <h4 className={"position-absolute text-white"} style={{left: "50%", transform: "translate(-50%, 4%)"}} >{`${date < 10 ? "0" : ""}${date}`}</h4>
                        </div>
                    </foreignObject>
                </svg>
                <span>
                    {work[0].listingDate.toDateString().split(" ")[0]}
                    {" "}⋅{" "}
                    {numGroups} group{numGroups > 1 ? "s" : ""}
                    {" "}⋅{" "}
                    {assignmentCount > 0 && <>{assignmentCount} assignment{assignmentCount > 1 ? "s" : ""}</>}
                    {assignmentCount > 0 && testCount > 0 && " and "}
                    {testCount > 0 && <>{testCount} test{testCount > 1 ? "s" : ""}</>}
                    {viewBy === "startDate" ? " set" : " due"}
                </span>
                <i className={classNames("icon icon-chevron-right icon-dropdown-90", {"active": open})} />
            </div>
        </div>
        <Collapse isOpen={open} className={"date-assignment-list"}>
            {Object.entries(groupsAndWork).map(([groupId, work]) => <GroupWorkList 
                key={groupId}
                groupId={parseInt(groupId)}
                work={work}
                initialOpen={numGroups === 1}
                parentOpen={open}
            />)}
        </Collapse>
    </>;
};

const monthHexagon = calculateHexagonProportions(12, 1);
const shouldOpenMonth = (year: number, month: number) => {
    return (new Date()).getMonth() === month && (new Date()).getFullYear() === year;
};
const MonthWorkList = ({year, month, datesAndWork}: {year: number, month: number, datesAndWork: [number, ValidWorkWithListingDate[]][]}) => {
    const [open, setOpen] = useState<boolean>(shouldOpenMonth(year, month));
    const assignmentCount = useMemo(() => datesAndWork.reduce((n, [_, as]) => n + as.filter(isAssignment).length, 0), [datesAndWork]);
    const testCount = useMemo(() => datesAndWork.reduce((n, [_, as]) => n + as.filter(isQuiz).length, 0), [datesAndWork]);
    const {collapsed, setCollapsed, viewBy} = useContext(ManageAssignmentsContext);
    useEffect(() => {
        if (collapsed) setOpen(false);
    }, [collapsed]);
    return <>
        <div tabIndex={0} role={"button"} aria-label={(open ? "Collapse" : "Expand") + ` list for ${MONTH_NAMES[month]}`}
            className={"month-label w-100 text-end d-flex"} onKeyPress={(e) => {
                if (e.key === "Enter") {
                    setOpen(o => !o);
                    setCollapsed(false);
                }
            }} onClick={() => {
                setOpen(o => !o);
                setCollapsed(false);
            }}
        >
            <div className={"h-100 text-center position-relative"} style={{width: dateHexagon.halfWidth * 2, paddingTop: 3}}>
                <svg height={monthHexagon.quarterHeight * 4} width={monthHexagon.halfWidth * 2}>
                    <Hexagon className={"fill-secondary"} {...monthHexagon}/>
                    <svg x={monthHexagon.halfWidth - (open ? 7.4 : 3)} y={monthHexagon.quarterHeight * 2 - (open ? 4 : 6.5)}>
                        <polygon fill={"#ffffff"} points="0 1.75 1.783 0 8.75 7 1.783 14 0 12.25 5.25 7"
                            transform={open ? "rotate(90 7 7.5)" : "rotate(0 7 7.5)"}
                        />
                    </svg>
                </svg>
            </div>
            <h4>{`${MONTH_NAMES[month]}`}</h4>
            <div className={"mx-3 flex-grow-1 border-bottom"} style={{height: "1.1rem"}}/>
            <span className={"pt-1 month-assignment-count"}>
                {assignmentCount > 0 && <>{assignmentCount} assignment{assignmentCount > 1 ? "s" : ""}</>}
                {assignmentCount > 0 && testCount > 0 && " and "}
                {testCount > 0 && <>{testCount} test{testCount > 1 ? "s" : ""}</>}
                {viewBy === "startDate" ? " set" : " due"}
            </span>
        </div>
        {/* not a <Collapse/> so as to avoid DOM bloat – maybe reconsider? */}
        {open && datesAndWork.map(([d, as]) => <DateWorkList key={d} date={d} work={as}/>)}
    </>;
};

type WorkGroupedByDate = [number, [number, [number, ValidWorkWithListingDate[]][]][]][];
export const ManageAssignments = ({user}: {user: RegisteredUserDTO}) => {
    const assignmentsSetByMeQuery = useGetMySetAssignmentsQuery(undefined);
    const testsSetByMeQuery = useGetQuizAssignmentsSetByMeQuery(undefined);
    const { data: assignmentsSetByMe } = assignmentsSetByMeQuery;
    const { data: testsSetByMe } = testsSetByMeQuery;
    const { data: groups } = useGetGroupsQuery(false);

    const workSetByMe : IAssignmentLike[] = useMemo(() => [ 
        ...(assignmentsSetByMe ?? []), ...(testsSetByMe ?? []) 
    ], [assignmentsSetByMe, testsSetByMe]);

    const [viewBy, setViewBy] = useState<"startDate" | "dueDate">("startDate");

    // Empty list means all groups are included, non-empty means only those in the list are included
    const [groupsToInclude, setGroupsToInclude] = useState<Item<number>[]>([]);
    const [workTypesToInclude, setWorkTypesToInclude] = useState<Item<string>[]>([]);
    const [subjectsToInclude, setSubjectsToInclude] = useState<Item<string>[]>([]);
    const [workTitleToInclude, setWorkTitleToInclude] = useState<string>("");

    // --- Slow-to-calculate constant lookup maps for ease of locating gameboards, groups, etc. ---

    const groupsById = useMemo<{[id: number]: UserGroupDTO | undefined}>(() => {
        return groups?.reduce((acc, g) => g.id ? {...acc, [g.id]: g} : acc, {} as {[id: number]: UserGroupDTO}) ?? {};
    }, [groups]);

    // Map from group id -> whether group should be included or not
    const groupFilter = useCallback((work: IAssignmentLike) => {
        if (groupsToInclude.length === 0) return true;
        if (!work.groupId) return false;
        return groupsToInclude.map(item => item.value).includes(work.groupId);
    }, [groupsToInclude]);

    const workTypeFilter = useCallback((work: IAssignmentLike) => {
        if (workTypesToInclude.length === 0) return true;
        if (isAssignment(work)) {
            return workTypesToInclude.map(item => item.value).includes("assignment");
        } else if (isQuiz(work)) {
            return workTypesToInclude.map(item => item.value).includes("test");
        }
        return false;
    }, [workTypesToInclude]);

    const subjectsFilter = useCallback((work: IAssignmentLike) => {
        if (subjectsToInclude.length === 0) return true;
        const workTags = isAssignment(work)
            ? work.gameboard?.tags
            : isQuiz(work) 
                ? work.quizSummary?.tags
                : undefined;
        const subjects = tags.getSubjectTags((workTags ?? []) as TAG_ID[]).map(t => t.id);
        if (!subjects || subjects.length === 0) return false;
        return subjectsToInclude.map(item => item.value).some(subject => subjects.includes(subject as TAG_ID));
    }, [subjectsToInclude]);

    const workTitleFilter = useCallback((work: IAssignmentLike) => {
        const workTitle = isAssignment(work)
            ? work.gameboard?.title
            : isQuiz(work) 
                ? work.quizSummary?.title
                : undefined;
        if (!workTitle) return false;
        return workTitle.toLowerCase().includes(workTitleToInclude.toLowerCase());
    }, [workTitleToInclude]);

    const workFilter = useCallback((work: IAssignmentLike) => {
        return groupFilter(work) && workTypeFilter(work) && subjectsFilter(work) && workTitleFilter(work);
    }, [groupFilter, workTypeFilter, subjectsFilter, workTitleFilter]);

    const someActiveFilter = groupsToInclude.length > 0 || workTypesToInclude.length > 0 || workTitleToInclude.length > 0 || subjectsToInclude.length > 0;

    // Map from group id -> ids of boards / tests they are assigned to
    const workByGroup = useMemo(() => {
        const acc = {} as {[id: number]: {boards?: IAssignmentLike[], tests?: IAssignmentLike[]}};
        workSetByMe.forEach(a => {
            if (!a.groupId) return;
            if (!(a.groupId in acc)) {
                acc[a.groupId] = {};
            }
            if ("gameboardId" in a && a.gameboardId) {
                acc[a.groupId].boards = [...(acc[a.groupId].boards ?? []), a];
            } else if ("quizId" in a && a.quizId) {
                acc[a.groupId].tests = [...(acc[a.groupId].tests ?? []), a];
            }
        });
        return acc;
    }, [workSetByMe]);

    // Logic to handle showing older assignments - we show the "load older assignments" button if we haven't shown
    // the oldest assignment yet
    const [earliestShowDate, setEarliestShowDate] = useState<Date>(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const oldestWorkDate = useMemo<Date>(() => new Date(
        workSetByMe
            ?.filter(a => a.id && isValidWork(a) && (viewBy === "startDate" || isDefined(a.dueDate)))
            .filter(workFilter)
            .reduce((oldest, a) => {
                const assignmentTimestamp = a.scheduledStartDate?.valueOf() ?? a.creationDate?.valueOf() ?? Date.now();
                return assignmentTimestamp < oldest
                    ? assignmentTimestamp : oldest;
            }, Date.now()) ?? Date.now()
    ), [workSetByMe, workFilter, viewBy]);

    const extendBackSixMonths = (until?: Date) => setEarliestShowDate(esd => {
        const d = new Date(esd.valueOf());
        d.setMonth(d.getMonth() - 6);
        if (until) {
            while (d.valueOf() > until.valueOf()) {
                d.setMonth(d.getMonth() - 6);
            }
        }
        return d;
    });

    // The assignments that will be shown in the schedule, filtered by groups, and grouped by date
    const workGroupedByDate = useMemo<WorkGroupedByDate>(() => {
        if (!workSetByMe || workSetByMe.length === 0) return [];
        const sortedWork: ValidWorkWithListingDate[] = sortBy(
            workSetByMe
                .map((a) => ({
                    ...a,
                    listingDate: new Date(viewBy === "startDate" ? getAssignmentStartDate(a) : (a.dueDate ?? 0).valueOf()),
                    additionalManagerPrivileges: (a?.groupId && groupsById[a.groupId]?.additionalManagerPrivileges) ?? false
                } as ValidWorkWithListingDate))
                // IMPORTANT - filter ensures that id, gameboard/quiz id, and group id exist so the cast to ValidAssignmentWithListingDate was/will be valid
                .filter(a => a.id && isValidWork(a) && (viewBy === "startDate" || isDefined(a.dueDate)))
                .filter(workFilter)
            , a => a.listingDate.valueOf()
        );
        if (sortedWork.length === 0) return [];
        const latestWorkDate = sortedWork[sortedWork.length - 1].listingDate;
        const workFilteredByDate = sortedWork.filter(a => a.listingDate.valueOf() >= earliestShowDate.valueOf());
        if (workFilteredByDate.length === 0) {
            extendBackSixMonths(latestWorkDate);
            return [];
        }
        function parseNumericKey<T>([k, v]: [string, T]): [number, T] { return [parseInt(k), v]; }
        return Object.entries(mapValues(
            groupBy(workFilteredByDate, a => a.listingDate.getFullYear()),
            as => Object.entries(mapValues(
                groupBy(as, a => a.listingDate.getMonth()),
                _as => Object.entries(groupBy(_as, a => a.listingDate.getDate())).map(parseNumericKey)
            )).map(parseNumericKey)
        )).map(parseNumericKey);
    }, [workSetByMe, workFilter, viewBy, groupsById, earliestShowDate]);

    const notAllPastWorkIsListed = earliestShowDate.valueOf() >= oldestWorkDate.valueOf();

    // Flag to notify children components to completely collapse all assignment sub-lists, so only months are showing
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const pageHelp = <span>
        Use this page to set and manage assigned work for your groups, and view set work as a timeline. You can unassign work, and assign existing work to other groups.
    </span>;

    const dispatch = useAppDispatch();

    const setNewAssignmentModal = () : ActiveModalProps => ({
        title: "Set a new assignment",
        body: <PhyAddGameboardButtons />
    });

    return <PageContainer className="mb-7"
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle="Set / manage work" icon={{type: "icon", icon: "icon-events"}} help={pageHelp}/>
        }
        sidebar={
            <ManageAssignmentsSidebar 
                assignmentsSetByMe={assignmentsSetByMe}
                groupsToInclude={groupsToInclude} 
                setGroupsToInclude={setGroupsToInclude}
                workTypesToInclude={workTypesToInclude}
                setWorkTypesToInclude={setWorkTypesToInclude}
                subjectsToInclude={subjectsToInclude}
                setSubjectsToInclude={setSubjectsToInclude}
                workTitleToInclude={workTitleToInclude}
                setWorkTitleToInclude={setWorkTitleToInclude}
                viewBy={viewBy} 
                setViewBy={setViewBy}
                collapse={() => setCollapsed(true)}
                groups={groups} 
                user={user}
            />
        }
    >
        <PageMetadata noTitle>
            <PageFragment fragmentId={"help_toptext_manage_assignments"} ifNotFound={RenderNothing} />
        </PageMetadata>
        <ShowLoadingQuery
            defaultErrorTitle="Error loading assignments and/or question decks"
            query={combineQueries(assignmentsSetByMeQuery, testsSetByMeQuery, discardResults)}
        >
            <ManageAssignmentsContext.Provider value={{groupsById, workByGroup, groups: groups ?? [], collapsed, setCollapsed, viewBy}}>
                <div className="px-md-4 ps-2 pe-2 timeline-column mb-4 pt-2">
                    <Card>
                        <CardBody>
                            <Row className="row-cols-1 row-cols-md-2">
                                <Col>
                                    <Button block color="keyline" className="mt-2" onClick={() => dispatch(openActiveModal(setNewAssignmentModal()))}><h5 className="mb-0">Set a new assignment</h5></Button>
                                </Col>
                                <Col>
                                    <Button block tag={Link} to="/set_tests" color="keyline" className="mt-2"><h5 className="mb-0">Set a new test</h5></Button>
                                </Col>
                            </Row>
                            <div className="section-divider-bold" />

                            {/* Groups-related alerts */}
                            {groups && groups.length === 0 && <div className="mt-1">
                                You have not created any groups to assign work to.
                                Please <Link to="/groups">create a group here first.</Link>
                            </div>}
                            {someActiveFilter && workGroupedByDate.length === 0 && <div className="mt-1">
                                There is no work matching your filters.
                            </div>}
                            {notAllPastWorkIsListed && <div className="mt-1">
                                <Button size="sm" onClick={() => extendBackSixMonths()}>
                                    Show work before {formatDate(earliestShowDate)}
                                </Button>
                            </div>}
                            {workGroupedByDate.length > 0 && <div className={classNames("timeline w-100", {"pt-2": !notAllPastWorkIsListed})}>
                                {workGroupedByDate.map(([y, ms]) =>
                                    <Fragment key={y}>
                                        <div className="year-label w-100 text-end">
                                            <h3 className="mb-n3">{`${y}`}</h3>
                                            <hr className="ms-4"/>
                                        </div>
                                        {ms.map(([m, ds]) => <MonthWorkList key={m} year={y} month={m} datesAndWork={ds}/>)}
                                    </Fragment>
                                )}
                                <div className={classNames("bg-timeline", {"fade-in": !notAllPastWorkIsListed})}/>
                            </div>}
                        </CardBody>
                    </Card>
                </div>
            </ManageAssignmentsContext.Provider>
        </ShowLoadingQuery>
    </PageContainer>;
};
