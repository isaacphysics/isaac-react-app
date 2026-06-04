import {
    useGetGroupsQuery,
    useGetMySetAssignmentsQuery} from "../../state";
import {AssignmentDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import sortBy from "lodash/sortBy";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import React, {Fragment, useContext, useEffect, useMemo, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Row} from "reactstrap";
import {
    getAssignmentStartDate,
    isDefined,
    isOverdue,
    Item,
    MONTH_NAMES,
    PATHS} from "../../services";
import {
    ManageAssignmentsContext,
    ValidAssignmentWithListingDate
} from "../../../IsaacAppTypes";
import {calculateHexagonProportions, Hexagon} from "../elements/svg/Hexagon";
import classNames from "classnames";
import {Link} from "react-router-dom";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {formatDate, getFriendlyDaysUntil} from "../elements/DateString";
import { PageContainer } from "../elements/layout/PageContainer";
import { ManageAssignmentsSidebar } from "../elements/sidebar/ManageAssignmentsSidebar";
import { GameboardCard, GameboardLinkLocation } from "../elements/cards/GameboardCard";
import { useManageAssignment } from "../../services/setAssignment";

// this is similar to MyAssignmentsContents/AssignmentCard, but:
// - inside the card's children, does not highlight past deadlines.
// - GameboardCard.usageDisplay is undefined, so no completion / group statistics are shown in the top right.
// - GameboardCard.allowManaging is set
const AssignmentCard = ({assignment}: {assignment: AssignmentDTO}) => {
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate;

    const { openAssignModal, unassign } = useManageAssignment(assignment);

    return <GameboardCard 
        className="mt-2"
        gameboard={assignment.gameboard}
        linkLocation={GameboardLinkLocation.Title}
        assignment={assignment}
        openAssignModal={openAssignModal}
        usageDisplay={{type: "progressLink", assignment}}
        unassign={unassign}
        allowManaging
    >
        <Row className="w-100">
            <Col>
                {isDefined(assignment.groupName) &&
                    <p className="mb-0">Set to <strong>{assignment.groupName}</strong></p>
                }
                {isDefined(assignmentStartDate) && 
                    <p className="mb-0" data-testid={"gameboard-assigned"}>
                        Assigned <strong>{getFriendlyDaysUntil(assignmentStartDate)}</strong>
                    </p>
                }
                {isDefined(assignment.dueDate) && isDefined(assignment.gameboard) && isOverdue(assignment) && <p className="mb-0">
                    Due <strong>{getFriendlyDaysUntil(assignment.dueDate)}</strong>
                </p>}
            </Col>
        </Row>
        
        {assignment.notes && <p className="mb-0"><strong>Notes:</strong> {assignment.notes}</p>}
    </GameboardCard>;
};

// If the hexagon proportions change, the CSS class bg-timeline needs revisiting
const dateHexagon = calculateHexagonProportions(20, 1);

const DateAssignmentList = ({date, assignments}: {date: number; assignments: ValidAssignmentWithListingDate[]}) => {
    const [open, setOpen] = useState<boolean>(false);
    const {collapsed, setCollapsed, viewBy} = useContext(ManageAssignmentsContext);

    useEffect(() => {
        if (collapsed) setOpen(false);
    }, [collapsed]);

    return <>
        <div tabIndex={0} role={"button"} aria-label={(open ? "Collapse" : "Expand") + ` list for day ${date}`} onKeyPress={(e) => {
            if (e.key === "Enter") {
                setOpen(o => !o);
                setCollapsed(false);
            }
        }} onClick={() => {
            setOpen(o => !o);
            setCollapsed(false);
        }} className={"hexagon-date"}>
            <svg height={dateHexagon.quarterHeight * 4} width={"100%"}>
                <Hexagon className={"fill-secondary"} {...dateHexagon}/>
                {<foreignObject height={dateHexagon.quarterHeight * 4} width={"100%"} y={11} x={dateHexagon.halfWidth * 2.5 + 12}>
                    <p className={classNames("date-assignment-count", {"text-muted": !open})}>
                        {assignments[0].listingDate.toDateString().split(" ")[0]} - {assignments.length} assignment{assignments.length > 1 ? "s" : ""}{viewBy === "startDate" ? " set" : " due"}
                    </p>
                </foreignObject>}
                <svg x={2.5 * dateHexagon.halfWidth - (open ? 7 : 3)} y={dateHexagon.quarterHeight * 2 - (open ? 3 : 6.5)}>
                    <polygon className={classNames("date-toggle-arrow fill-secondary", {"open": open})} points="0 1.75 1.783 0 8.75 7 1.783 14 0 12.25 5.25 7"
                        transform={open ? "rotate(90 7 7.5)" : "rotate(0 7 7.5)"}
                    />
                </svg>
                {<foreignObject height={dateHexagon.quarterHeight * 4} width={dateHexagon.halfWidth * 2} y={2} x={0}>
                    <div className={"position-relative w-100"}>
                        <h4 className={"position-absolute text-white"} style={{left: "50%", transform: "translate(-50%, 4%)"}} >{`${date < 10 ? "0" : ""}${date}`}</h4>
                    </div>
                </foreignObject>}
            </svg>
        </div>
        {open && <div className={"date-assignment-list"}>
            {assignments.map(a => <AssignmentCard
                key={a.id}
                assignment={a}
            />)}
        </div>}
    </>;
};

const monthHexagon = calculateHexagonProportions(12, 1);
const shouldOpenMonth = (year: number, month: number) => {
    return (new Date()).getMonth() === month && (new Date()).getFullYear() === year;
};
const MonthAssignmentList = ({year, month, datesAndAssignments}: {year: number, month: number, datesAndAssignments: [number, ValidAssignmentWithListingDate[]][]}) => {
    const [open, setOpen] = useState<boolean>(shouldOpenMonth(year, month));
    const assignmentCount = useMemo(() => datesAndAssignments.reduce((n, [_, as]) => n + as.length, 0), [datesAndAssignments]);
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
            <span className={"pt-1 month-assignment-count"}>{assignmentCount} assignment{assignmentCount > 1 ? "s" : ""}{viewBy === "startDate" ? " set" : " due"}</span>
        </div>
        {open && datesAndAssignments.map(([d, as]) => <DateAssignmentList key={d} date={d} assignments={as}/>)}
    </>;
};

type AssignmentsGroupedByDate = [number, [number, [number, ValidAssignmentWithListingDate[]][]][]][];
export const ManageAssignments = ({user}: {user: RegisteredUserDTO}) => {
    const assignmentsSetByMeQuery = useGetMySetAssignmentsQuery(undefined);
    const { data: assignmentsSetByMe } = assignmentsSetByMeQuery;
    const { data: groups } = useGetGroupsQuery(false);

    const [viewBy, setViewBy] = useState<"startDate" | "dueDate">("startDate");

    // Empty list means all groups are included, non-empty means only those in the list are included
    const [groupsToInclude, setGroupsToInclude] = useState<Item<number>[]>([]);

    // --- Slow-to-calculate constant lookup maps for ease of locating gameboards, groups, etc. ---

    const groupsById = useMemo<{[id: number]: UserGroupDTO | undefined}>(() => {
        return groups?.reduce((acc, g) => g.id ? {...acc, [g.id]: g} : acc, {} as {[id: number]: UserGroupDTO}) ?? {};
    }, [groups]);

    // Map from group id -> whether group should be included or not
    const groupFilter = useMemo<{[id: number]: boolean}>(() => {
        if (groupsToInclude.length === 0) {
            return mapValues(groupsById, () => true);
        }
        return groupsToInclude.reduce((acc, n) => ({...acc, [n.value]: true}), {});
    }, [groupsToInclude, groupsById]);

    // Map from group id -> ids of boards they are assigned to
    const boardIdsByGroupId = useMemo<{[id: number]: string[] | undefined}>(() => {
        return assignmentsSetByMe?.reduce((acc, a) => {
            if (!a.groupId || !a.gameboardId) return acc;
            return a.groupId in acc ? {...acc, [a.groupId]: [...acc[a.groupId], a.gameboardId]} : {...acc, [a.groupId]: [a.gameboardId]};
        }, {} as {[id: number]: string[]}) ?? {};
    }, [assignmentsSetByMe]);

    // Logic to handle showing older assignments - we show the "load older assignments" button if we haven't shown
    // the oldest assignment yet
    const [earliestShowDate, setEarliestShowDate] = useState<Date>(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const oldestAssignmentDate = useMemo<Date>(() => new Date(
        assignmentsSetByMe?.filter(a => a.id && a.gameboardId && a.groupId && groupFilter[a.groupId] && (viewBy === "startDate" || isDefined(a.dueDate)))
            .reduce((oldest, a) => {
                const assignmentTimestamp = a.scheduledStartDate?.valueOf() ?? a.creationDate?.valueOf() ?? Date.now();
                return assignmentTimestamp < oldest
                    ? assignmentTimestamp : oldest;
            }, Date.now()) ?? Date.now()
    ), [assignmentsSetByMe, groupFilter, viewBy]);

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
    const assignmentsGroupedByDate = useMemo<AssignmentsGroupedByDate>(() => {
        if (!assignmentsSetByMe || assignmentsSetByMe.length === 0) return [];
        const sortedAssignments: ValidAssignmentWithListingDate[] = sortBy(
            assignmentsSetByMe
                .map((a) => ({...a, listingDate: new Date(viewBy === "startDate" ? getAssignmentStartDate(a) : (a.dueDate ?? 0).valueOf()), additionalManagerPrivileges: (a?.groupId && groupsById[a.groupId]?.additionalManagerPrivileges) ?? false} as ValidAssignmentWithListingDate))
                // IMPORTANT - filter ensures that id, gameboard id, and group id exist so the cast to ValidAssignmentWithListingDate was/will be valid
                .filter(a => a.id && a.gameboardId && a.groupId && groupFilter[a.groupId] && (viewBy === "startDate" || isDefined(a.dueDate)))
            , a => a.listingDate.valueOf()
        );
        if (sortedAssignments.length === 0) return [];
        const latestAssignmentDate = sortedAssignments[sortedAssignments.length - 1].listingDate;
        const assignmentsFilteredByDate = sortedAssignments.filter(a => a.listingDate.valueOf() >= earliestShowDate.valueOf());
        if (assignmentsFilteredByDate.length === 0) {
            extendBackSixMonths(latestAssignmentDate);
            return [];
        }
        function parseNumericKey<T>([k, v]: [string, T]): [number, T] { return [parseInt(k), v]; }
        return Object.entries(mapValues(
            groupBy(assignmentsFilteredByDate, a => a.listingDate.getFullYear()),
            as => Object.entries(mapValues(
                groupBy(as, a => a.listingDate.getMonth()),
                _as => Object.entries(groupBy(_as, a => a.listingDate.getDate())).map(parseNumericKey)
            )).map(parseNumericKey)
        )).map(parseNumericKey);
    }, [assignmentsSetByMe, groupFilter, earliestShowDate, viewBy]);

    const notAllPastAssignmentsAreListed = earliestShowDate.valueOf() >= oldestAssignmentDate.valueOf();

    // Flag to notify children components to completely collapse all assignment sub-lists, so only months are showing
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const pageHelp = <span>
        Use this page to manage assignments for your groups, and view them as a timeline. You can unassign work, and assign existing assignments to other groups.
    </span>;

    return <PageContainer className="mb-7"
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle="Assignment schedule" icon={{type: "icon", icon: "icon-events"}} help={pageHelp}/>
        }
        sidebar={
            <ManageAssignmentsSidebar 
                assignmentsSetByMe={assignmentsSetByMe}
                groupsToInclude={groupsToInclude} 
                setGroupsToInclude={setGroupsToInclude}
                viewBy={viewBy} 
                setViewBy={setViewBy}
                collapse={() => setCollapsed(true)}
                groups={groups} 
                user={user}
            />
        }
    >
        {/*<h4 className="mt-4 mb-3">*/}
        {/*    Assign a {siteSpecific("question deck", "quiz")} from...*/}
        {/*</h4>*/}
        {/*<PhyAddGameboardButtons className="mb-4" redirectBackTo="/assignment_schedule"/>*/}
        <ShowLoadingQuery
            defaultErrorTitle="Error loading assignments and/or question decks"
            query={assignmentsSetByMeQuery}
        >
            <ManageAssignmentsContext.Provider value={{groupsById, groupFilter, boardIdsByGroupId, groups: groups ?? [], collapsed, setCollapsed, viewBy}}>
                <div className="px-md-4 ps-2 pe-2 timeline-column mb-4 pt-2">
                    <Card className="mt-2">
                        <CardBody>
                            <p>
                                Use the <Link to={PATHS.SET_ASSIGNMENTS}>set assignments</Link> page to schedule new assignments to your groups.
                            </p>
                            {/* Groups-related alerts */}
                            {groups && groups.length === 0 && <div className="mt-3">
                                You have not created any groups to assign work to.
                                Please <Link to="/groups">create a group here first.</Link>
                            </div>}
                            {groupsToInclude.length > 0 && assignmentsGroupedByDate.length === 0 && <div className="mt-3">
                                There are no assignments set to group{groupsToInclude.length > 1 ? "s" : ""}: {groupsToInclude.map(g => g.label).join(", ")}
                            </div>}
                            {notAllPastAssignmentsAreListed && <div className="mt-3">
                                <Button size="sm" onClick={() => extendBackSixMonths()}>
                                    Show assignments before {formatDate(earliestShowDate)}
                                </Button>
                            </div>}
                            {assignmentsGroupedByDate.length > 0 && <div className={classNames("timeline w-100", {"pt-2": !notAllPastAssignmentsAreListed})}>
                                {assignmentsGroupedByDate.map(([y, ms]) =>
                                    <Fragment key={y}>
                                        <div className="year-label w-100 text-end">
                                            <h3 className="mb-n3">{`${y}`}</h3>
                                            <hr className="ms-4"/>
                                        </div>
                                        {ms.map(([m, ds]) => <MonthAssignmentList key={m} year={y} month={m} datesAndAssignments={ds}/>)}
                                    </Fragment>
                                )}
                                <div className={classNames("bg-timeline", {"fade-in": !notAllPastAssignmentsAreListed})}/>
                            </div>}
                        </CardBody>
                    </Card>
                </div>
            </ManageAssignmentsContext.Provider>
        </ShowLoadingQuery>
    </PageContainer>;
};
