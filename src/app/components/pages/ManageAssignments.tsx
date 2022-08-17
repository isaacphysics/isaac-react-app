import {assignGameboard, isaacApi, selectors, useAppDispatch, useAppSelector} from "../../state";
import {GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import {sortBy, groupBy, mapValues, range} from "lodash";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import React, {
    ChangeEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {
    Container,
    Row,
    Col,
    Button,
    CardHeader,
    Card,
    CardBody,
    Label,
    Input,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Modal,
    CardFooter,
    Alert
} from "reactstrap";
import {BoardLimit, formatBoardOwner} from "../../services/gameboards";
import {BoardOrder, ManageAssignmentContext, ValidAssignmentWithListingDate} from "../../../IsaacAppTypes";
import {calculateHexagonProportions, Hexagon} from "../elements/svg/Hexagon";
import {ASSIGNMENT_PROGRESS_PATH, MONTH_NAMES} from "../../services/constants";
import classNames from "classnames";
import {isStaff} from "../../services/user";
import Select from "react-select";
import {Item, itemise, selectOnChange} from "../../services/select";
import {currentYear, DateInput} from "../elements/inputs/DateInput";
import {isDefined} from "../../services/miscUtils";
import {siteSpecific} from "../../services/siteConstants";
import {GameboardViewerInner} from "./Gameboard";

interface AssignmentListEntryProps {
    assignment: ValidAssignmentWithListingDate;
    group?: UserGroupDTO;
}
const AssignmentListEntry = ({assignment, group}: AssignmentListEntryProps) => {
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const {openAssignmentModal} = useContext(ManageAssignmentContext);
    const [ unassignGameboard ] = isaacApi.endpoints.unassignGameboard.useMutation();
    const deleteAssignment = () => {
        if (confirm(`Are you sure you want to unassign ${assignment.gameboard?.title ?? "this gameboard"} from ${assignment.groupName ? `group ${assignment.groupName}` : "this group"}?`)) {
            unassignGameboard({boardId: assignment.gameboardId, groupId: assignment.groupId});
        }
    }
    return <Card className={"my-1"}>
        <CardHeader className={"pt-2 pb-0 d-flex text-break"}>
            <h4>{assignment.gameboard?.title ?? "No gameboard title"}</h4>
            <div className={"ml-auto text-right"}>
                <Button color="link" size="sm" onClick={() => openAssignmentModal(assignment)}>
                    Copy
                </Button>
                <Button color="link" size="sm" onClick={deleteAssignment}>
                    Delete
                </Button>
            </div>
        </CardHeader>
        <CardBody>
            <div>Assigned to: <strong>{assignment.groupName}</strong></div>
            {assignment.dueDate && <div>Due date: <strong>{new Date(assignment.dueDate).toDateString()}</strong></div>}
            {assignment.gameboard && <div>By: <strong>{formatBoardOwner(user, assignment.gameboard)}</strong></div>}
            <div>
                <a color="link" target={"_blank"} href={`/${ASSIGNMENT_PROGRESS_PATH}/${assignment.id}`}>
                    View assignment progress <span className={"sr-only"}>(opens in new tab)</span>
                </a>
            </div>
        </CardBody>
    </Card>;
}

// If the hexagon proportions change, the CSS class bg-timeline needs revisiting
const dateHexagon = calculateHexagonProportions(20, 1);
const DateAssignmentList = ({date, assignments}: {date: number; assignments: ValidAssignmentWithListingDate[]}) => {
    const [open, setOpen] = useState<boolean>(false);
    const {boardsById, groupsById, collapsed, setCollapsed} = useContext(ManageAssignmentContext);
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
                    <p className={classNames("date-assignment-count", {"text-muted": !open})}>{assignments.length} assignment{assignments.length > 1 ? "s" : ""}</p>
                </foreignObject>}
                <svg x={2.5 * dateHexagon.halfWidth - (open ? 7 : 3)} y={dateHexagon.quarterHeight * 2 - (open ? 3 : 6.5)}>
                    <polygon className={classNames("date-toggle-arrow fill-secondary", {"open": open})} points="0 1.75 1.783 0 8.75 7 1.783 14 0 12.25 5.25 7"
                             transform={open ? "rotate(90 7 7.5)" : "rotate(0 7 7.5)"}/>
                </svg>
                {<foreignObject height={dateHexagon.quarterHeight * 4} width={dateHexagon.halfWidth * 2} y={2} x={0}>
                    <div className={"position-relative w-100"}>
                        <h3 className={"position-absolute text-white"} style={{left: "50%", transform: "translate(-50%)"}} >{`${date < 10 ? "0" : ""}${date}`}</h3>
                    </div>
                </foreignObject>}
            </svg>
        </div>
        {open && <div className={"date-assignment-list"}>
            {assignments.map(a => <AssignmentListEntry key={a.id} assignment={{...a, gameboard: a.gameboardId ? boardsById[a.gameboardId] : undefined}} group={a.groupId ? groupsById[a.groupId] : undefined} /> )}
        </div>}
    </>
}

const monthHexagon = calculateHexagonProportions(12, 1);
const MAX_DAYS_TO_OPEN_MONTH_LIST = 10;
const MonthAssignmentList = ({month, datesAndAssignments}: {month: number, datesAndAssignments: [number, ValidAssignmentWithListingDate[]][]}) => {
    const [open, setOpen] = useState<boolean>(datesAndAssignments.length <= MAX_DAYS_TO_OPEN_MONTH_LIST);
    const assignmentCount = useMemo(() => datesAndAssignments.reduce((n, [_, as]) => n + as.length, 0), [datesAndAssignments]);
    const {collapsed, setCollapsed} = useContext(ManageAssignmentContext);
    useEffect(() => {
        if (collapsed) setOpen(false);
    }, [collapsed]);
    return <>
        <div tabIndex={0} role={"button"} aria-label={(open ? "Collapse" : "Expand") + ` list for ${MONTH_NAMES[month]}`}
             className={"month-label w-100 text-right d-flex"} onKeyPress={(e) => {
            if (e.key === "Enter") {
                setOpen(o => !o);
                setCollapsed(false);
            }
        }} onClick={() => {
            setOpen(o => !o);
            setCollapsed(false);
        }}>
            <div className={"h-100 text-center position-relative"} style={{width: dateHexagon.halfWidth * 2, paddingTop: 3}}>
                <svg height={monthHexagon.quarterHeight * 4} width={monthHexagon.halfWidth * 2}>
                    <Hexagon className={"fill-secondary"} {...monthHexagon}/>
                    <svg x={monthHexagon.halfWidth - (open ? 7.4 : 3)} y={monthHexagon.quarterHeight * 2 - (open ? 4 : 6.5)}>
                        <polygon fill={"#ffffff"} points="0 1.75 1.783 0 8.75 7 1.783 14 0 12.25 5.25 7"
                                 transform={open ? "rotate(90 7 7.5)" : "rotate(0 7 7.5)"}/>
                    </svg>
                </svg>
            </div>
            <h4>{`${MONTH_NAMES[month]}`}</h4>
            <div className={"mx-3 flex-grow-1 border-bottom"} style={{height: "1.1rem"}}/>
            <span className={"pt-1 month-assignment-count"}>{assignmentCount} assignment{assignmentCount > 1 ? "s" : ""}</span>
        </div>
        {open && datesAndAssignments.map(([d, as]) => <DateAssignmentList key={d} date={d} assignments={as}/>)}
    </>;
}

type AssignmentsGroupedByDate = [number, [number, [number, ValidAssignmentWithListingDate[]][]][]][];
const AssignmentTimeline = ({assignmentsGroupedByDate}: {assignmentsGroupedByDate: AssignmentsGroupedByDate}) => {
    return <div className={"timeline w-100"}>
        {assignmentsGroupedByDate.map(([y, ms]) =>
            <>
                <div key={y} className={"year-label w-100 text-right"}><h3 className={"mb-n3"}>{`${y}`}</h3><hr/></div>
                {ms.map(([m, ds]) => <MonthAssignmentList key={m} month={m} datesAndAssignments={ds}/>)}
            </>
        )}
        <div className={"bg-timeline"}/>
    </div>;
}

interface AssignmentModalProps {
    user: RegisteredUserDTO;
    refetchAssignmentsSetByMe: () => void;
    showAssignmentModal: boolean;
    toggleAssignModal: () => void;
    assignmentToCopy: ValidAssignmentWithListingDate | undefined;
}
const AssignmentModal = ({user, refetchAssignmentsSetByMe, showAssignmentModal, toggleAssignModal, assignmentToCopy}: AssignmentModalProps) => {
    const dispatch = useAppDispatch();
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date>();
    const [scheduledStartDate, setScheduledStartDate] = useState<Date>();
    const [assignmentNotes, setAssignmentNotes] = useState<string>();

    const [showGameboardPreview, setShowGameboardPreview] = useState<boolean>(false);
    const toggleGameboardPreview = () => setShowGameboardPreview(o => !o);

    const [selectedGameboard, setSelectedGameboard] = useState<Item<string>[]>();

    const {boardsById, groups, gameboards, boardIdsByGroupId} = useContext(ManageAssignmentContext);

    useEffect(() => {
        setSelectedGroups([]);
        if (assignmentToCopy) {
            // Copy existing assignment
            setSelectedGameboard([{value: assignmentToCopy.gameboardId, label: boardsById[assignmentToCopy.gameboardId]?.title ?? "No gameboard title"}]);
            setScheduledStartDate(assignmentToCopy.scheduledStartDate);
            setDueDate(assignmentToCopy.dueDate);
            setAssignmentNotes(assignmentToCopy.notes);
        } else {
            // Create from scratch
            setSelectedGameboard(undefined);
            setScheduledStartDate(() => {
                let d = new Date();
                d.setUTCHours(0,0,0,0);
                return d;
            });
            setDueDate(undefined);
            setAssignmentNotes(undefined);
        }
    }, [assignmentToCopy]);

    const assign = useCallback(() => {
        if (!selectedGameboard) return;
        // FIXME Strange error with copying and assigning
        dispatch(assignGameboard({boardId: selectedGameboard[0]?.value, groups: [...selectedGroups], dueDate, scheduledStartDate, notes: assignmentNotes})).then(success => {
            refetchAssignmentsSetByMe();
            if (success) {
                setSelectedGroups([]);
                setDueDate(undefined);
                setScheduledStartDate(undefined);
                setAssignmentNotes('');
            }
        });
    }, [selectedGameboard, dueDate, scheduledStartDate, assignmentNotes, setSelectedGroups, setDueDate,
        setScheduledStartDate, setAssignmentNotes]);

    const yearRange = range(currentYear, currentYear + 5);
    const currentMonth = (new Date()).getUTCMonth() + 1;

    useEffect(() => {
        if (showAssignmentModal) setShowGameboardPreview(false);
    }, [showAssignmentModal]);

    const alreadyAssignedGroupNames = useMemo<string[]>(() => {
        if (!selectedGameboard || selectedGameboard.length === 0 || !selectedGroups || selectedGroups.length === 0) return [];
        return selectedGroups.filter(g => g.value && boardIdsByGroupId[g.value].includes(selectedGameboard[0]?.value)).map(g => g.label);
    }, [selectedGroups, boardIdsByGroupId, selectedGameboard]);

    return <Modal isOpen={showAssignmentModal} toggle={toggleAssignModal}>
        <ModalHeader close={
            <button className="close" onClick={toggleAssignModal}>
                {"Close"}
            </button>
        }>
            {"Create new assignment"}
        </ModalHeader>
        <ModalBody>
            <Label className="w-100 pb-2">Group{isStaff(user) ? "(s)" : ""}:
                <Select inputId="groups-to-assign" isMulti={isStaff(user)} isClearable placeholder="None"
                        value={selectedGroups}
                        closeMenuOnSelect={!isStaff(user)}
                        onChange={selectOnChange(setSelectedGroups, false)}
                        options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
                />
            </Label>
            <Label className="w-100 pb-2">Gameboard:
                <Select inputId="gameboard-to-assign" isClearable placeholder="None"
                        value={selectedGameboard}
                        onChange={selectOnChange(setSelectedGameboard, false)}
                        options={gameboards.map(g => itemise(g.id ?? "", g.title ?? "No gameboard title"))}
                />
                {alreadyAssignedGroupNames && alreadyAssignedGroupNames.length > 0 && <Alert color={"warning"} className={"my-1"}>
                    This gameboard is already assigned to group{alreadyAssignedGroupNames.length > 1 ? "s" : ""}: {alreadyAssignedGroupNames.join(", ")}. You must delete the previous assignment{alreadyAssignedGroupNames.length > 1 ? "s" : ""} to set it again.
                </Alert>}
                {selectedGameboard && selectedGameboard?.[0]?.value && boardsById[selectedGameboard[0].value] && boardsById[selectedGameboard[0].value]?.contents && <Card className={"my-1"} >
                    <CardHeader className={"text-right"}><Button color={"link"} onClick={toggleGameboardPreview}>{showGameboardPreview ? "Hide" : "Show"} gameboard preview</Button></CardHeader>
                    {showGameboardPreview && <GameboardViewerInner gameboard={boardsById[selectedGameboard[0].value]}/>}
                    {showGameboardPreview && <CardFooter className={"text-right"}><Button color={"link"} onClick={toggleGameboardPreview}>{showGameboardPreview ? "Hide" : "Show"} gameboard preview</Button></CardFooter>}
                </Card>}
            </Label>
            <Label className="w-100 pb-2">Schedule an assignment start date <span className="text-muted"> (optional)</span>
                <DateInput value={scheduledStartDate} placeholder="Select your scheduled start date..." yearRange={yearRange} defaultYear={currentYear} defaultMonth={currentMonth}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => setScheduledStartDate(e.target.valueAsDate as Date)} />
            </Label>
            <Label className="w-100 pb-2">Due date reminder <span className="text-muted"> (optional)</span>
                <DateInput value={dueDate} placeholder="Select your due date..." yearRange={yearRange} defaultYear={currentYear} defaultMonth={currentMonth}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.valueAsDate as Date)} />
            </Label>
            {isStaff(user) && <Label className="w-100 pb-2">Notes (optional):
                <Input type="textarea"
                       spellCheck={true}
                       rows={3}
                       value={assignmentNotes}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignmentNotes(e.target.value)}
                />
                <p className="mt-1 mb-0"><small>{(assignmentNotes || '').length}/500 characters</small></p>
                {isDefined(assignmentNotes) && assignmentNotes.length > 500 &&
                <p className="mt-0 mb-0 text-danger"><small>You have exceeded the maximum length.</small></p>
                }
            </Label>}
            <Button
                className="mt-2 mb-2"
                block color={siteSpecific("secondary", "primary")}
                onClick={assign}
                disabled={selectedGroups.length === 0 || (isDefined(assignmentNotes) && assignmentNotes.length > 500) || !isDefined(selectedGameboard) || alreadyAssignedGroupNames.length === selectedGroups.length}
            >
                Assign to group{selectedGroups.length > 1 ? "s" : ""}
            </Button>
        </ModalBody>
        <ModalFooter>
            <Button block color="tertiary" onClick={toggleAssignModal}>Close</Button>
        </ModalFooter>
    </Modal>;
}

export const ManageAssignments = () => {
    // We know the user is logged in and is at least a teacher in order to visit this page
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const { data: assignmentsSetByMe, refetch: refetchAssignmentsSetByMe } = isaacApi.endpoints.getMySetAssignments.useQuery(undefined);
    const { data: gameboards } = isaacApi.endpoints.getGameboards.useQuery({startIndex: 0, limit: BoardLimit.All, sort: BoardOrder.created});
    const { data: groups } = isaacApi.endpoints.getGroups.useQuery(false);

    const [groupsToInclude, setGroupsToInclude] = useState<Item<number>[]>([]);

    const boardsById = useMemo<{[id: string]: GameboardDTO}>(() => {
        return gameboards?.boards.reduce((acc, b) => b.id ? {...acc, [b.id]: b} : acc, {} as {[id: string]: GameboardDTO}) ?? {};
    }, [gameboards]);

    const groupsById = useMemo<{[id: number]: UserGroupDTO}>(() => {
        return groups?.reduce((acc, g) => g.id ? {...acc, [g.id]: g} : acc, {} as {[id: number]: UserGroupDTO}) ?? {};
    }, [groups]);

    const groupFilter = useMemo<{[id: number]: boolean}>(() => {
        if (groupsToInclude.length === 0) {
            return mapValues(groupsById, () => true);
        }
        return groupsToInclude.reduce((acc, n) => ({...acc, [n.value]: true}), {});
    }, [groupsToInclude, groupsById]);

    // Map from group id -> ids of boards they are assigned to
    const boardIdsByGroupId = useMemo<{[id: number]: string[]}>(() => {
        return assignmentsSetByMe?.reduce((acc, a) => {
            if (!a.groupId || !a.gameboardId) return acc;
            return a.groupId in acc ? {...acc, [a.groupId]: [...acc[a.groupId], a.gameboardId]} : {...acc, [a.groupId]: [a.gameboardId]};
        }, {} as {[id: number]: string[]}) ?? {}
    }, [assignmentsSetByMe]);

    // Logic to handle showing older assignments - we show the "load older assignments" button if we haven't shown
    // the oldest assignment yet
    const [earliestShowDate, setEarliestShowDate] = useState<Date>(() => {
        let d = new Date();
        d.setUTCDate(d.getUTCDate() - 29) // initially show assignment up to 4 weeks old
        return d;
    });
    const oldestAssignmentDate = useMemo<Date>(() => new Date(
        assignmentsSetByMe?.filter(a => a.id && a.gameboardId && a.groupId && groupFilter[a.groupId])
            .reduce((oldest, a) => {
                const assignmentTimestamp = a.scheduledStartDate?.valueOf() ?? a.creationDate?.valueOf() ?? Date.now();
                return assignmentTimestamp < oldest
                    ? assignmentTimestamp : oldest;
            }, Date.now()) ?? Date.now()
        )
    , [assignmentsSetByMe, groupFilter]);
    const extendBackSixMonths = () => setEarliestShowDate(esd => {
        const d = new Date(esd.valueOf());
        d.setUTCMonth(d.getUTCMonth() - 6);
        return d;
    });

    const assignmentsGroupedByDate = useMemo<AssignmentsGroupedByDate>(() => {
        if (!assignmentsSetByMe) return [];
        const sortedAssignments: ValidAssignmentWithListingDate[] = sortBy(
            assignmentsSetByMe
            .map((a) => ({...a, listingDate: new Date((a.scheduledStartDate ?? a.creationDate ?? 0).valueOf())} as ValidAssignmentWithListingDate))
            // IMPORTANT - filter ensures that id, gameboard id, and group id exist so the cast to ValidAssignmentWithListingDate was/will be valid
            .filter(a => a.id && a.gameboardId && a.groupId && groupFilter[a.groupId] && a.listingDate.valueOf() >= earliestShowDate.valueOf())
            , a => a.listingDate.valueOf());
        function parseNumericKey<T>([k, v]: [string, T]): [number, T] { return [parseInt(k), v]; }
        return Object.entries(mapValues(
            groupBy(sortedAssignments, a => a.listingDate.getUTCFullYear()),
            as => Object.entries(mapValues(
                groupBy(as, a => a.listingDate.getUTCMonth()),
                _as => Object.entries(groupBy(_as, a => a.listingDate.getUTCDate())).map(parseNumericKey)
            )).map(parseNumericKey)
        )).map(parseNumericKey);
    }, [assignmentsSetByMe, groupFilter, earliestShowDate]);

    const [assignmentToCopy, setAssignmentToCopy] = useState<ValidAssignmentWithListingDate | undefined>();
    const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
    const openAssignmentModal = useCallback((assignment?: ValidAssignmentWithListingDate) => {
        setAssignmentToCopy(assignment);
        setShowAssignmentModal(true);
    }, [setAssignmentToCopy, setShowAssignmentModal]);
    const toggleAssignModal = () => setShowAssignmentModal(o => !o);

    const [collapsed, setCollapsed] = useState<boolean>(false);

    // --- Sticky header ---
    const headerScrollerSentinel = useRef<HTMLDivElement>(null);
    const headerScrollerFlag = useRef(false);
    const headerScrollerObserver = useRef<IntersectionObserver>();
    const stickyHeaderListContainer = useRef<HTMLDivElement>(null);

    const headerScrollerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        for (const entry of entries) {
            if (entry.target.id === 'header-sentinel') {
                if (entry.isIntersecting) {
                    stickyHeaderListContainer.current?.classList.remove('active');
                } else {
                    if (entry.boundingClientRect.top <= 0) {
                        // Gone up
                        stickyHeaderListContainer.current?.classList.add('active');
                    } else if (entry.boundingClientRect.top > 0) {
                        // Gone down
                        stickyHeaderListContainer.current?.classList.remove('active');
                    }
                }
            }
        }
    }
    useEffect(() => {
        if (headerScrollerSentinel.current && !headerScrollerObserver.current && !headerScrollerFlag.current) {
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 1.0,
            }
            headerScrollerObserver.current = new IntersectionObserver(headerScrollerCallback, options);
            headerScrollerObserver.current.observe(headerScrollerSentinel.current);
            headerScrollerFlag.current = true;
            // Uncommenting this return, disconnects the observer. Not sure why.
            // return () => alphabetScrollerObserver?.current?.disconnect();
        }
    });

    const header = <Card className={"container py-2 px-3 w-100"}>
        <Row>
            <Col xs={6}>
                <Label className={"w-100"}>Filter by group:
                    <Select inputId="groups-filter" isMulti isClearable placeholder="All"
                            value={groupsToInclude}
                            closeMenuOnSelect={!isStaff(user)}
                            onChange={selectOnChange(setGroupsToInclude, false)}
                            options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
                    />
                </Label>
            </Col>
            <Col xs={6} className={"py-1"}>
                <Button size={"sm"} block onClick={() => openAssignmentModal()}>
                    <span className={"d-block d-md-none"}>Create new</span>
                    <span className={"d-none d-md-block"}>Create new assignment</span>
                </Button>
                <Button size={"sm"} block onClick={() => {
                    setCollapsed(true);
                    if (headerScrollerSentinel.current && headerScrollerSentinel.current.getBoundingClientRect().top < 0) {
                        headerScrollerSentinel.current?.scrollIntoView();
                    }
                }}>
                    Collapse all
                </Button>
            </Col>
        </Row>
    </Card>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Manage assignments"} help={<span>
            Use this page to set and manage assignments to your groups. You can assign any gameboard you have saved to your account.
            <br/>
            Students in the group will be emailed when you set a new assignment.
        </span>} modalId={"manage_assignments_help"}/>
        <ManageAssignmentContext.Provider value={{boardsById, groupsById, groupFilter, boardIdsByGroupId, groups: groups ?? [], gameboards: gameboards?.boards ?? [], openAssignmentModal, collapsed, setCollapsed}}>
            <div className={"px-md-4 pl-2 pr-2 timeline-column mb-4"}>
                <div className="no-print">
                    <div id="header-sentinel" ref={headerScrollerSentinel}>&nbsp;</div>
                    <div ref={stickyHeaderListContainer} id="stickyheader">
                        {header}
                    </div>
                    {header}
                </div>
                {(earliestShowDate.valueOf() >= oldestAssignmentDate.valueOf()) && <div>
                    <Button size={"sm"} className={"mt-3"} onClick={extendBackSixMonths}>
                        Load assignments before {earliestShowDate.toDateString()}
                    </Button>
                </div>}
                <AssignmentTimeline assignmentsGroupedByDate={assignmentsGroupedByDate}/>
            </div>
            <AssignmentModal user={user} refetchAssignmentsSetByMe={refetchAssignmentsSetByMe}
                             showAssignmentModal={showAssignmentModal} toggleAssignModal={toggleAssignModal}
                             assignmentToCopy={assignmentToCopy}/>
        </ManageAssignmentContext.Provider>
    </Container>;
}