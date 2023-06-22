import {
    assignGameboard,
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetGameboardsQuery,
    useGetGroupsQuery,
    useGetMySetAssignmentsQuery, useGetMySetQuizzesQuery,
    useUnassignGameboardMutation
} from "../../state";
import {AssignmentDTO, GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import range from "lodash/range";
import sortBy from "lodash/sortBy";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import React, {ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState, Fragment} from "react";
import {
    Alert,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Container,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import {
    BoardLimit,
    formatBoardOwner,
    getAssignmentStartDate,
    isDefined,
    isStaff,
    Item,
    itemise,
    nthHourOf, PATHS,
    selectOnChange,
    siteSpecific,
    TODAY
} from "../../services";
import {
    AppGroup,
    AssignmentScheduleContext,
    BoardOrder,
    ValidAssignmentWithListingDate,
    ValidQuizAssignmentWithListingDate
} from "../../../IsaacAppTypes";
import classNames from "classnames";
import {currentYear, DateInput} from "../elements/inputs/DateInput";
import {GameboardViewerInner} from "./Gameboard";
import {Link, useLocation} from "react-router-dom";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {PhyAddGameboardButtons} from "./SetAssignments";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {formatDate} from "../elements/DateString";
import {MonthAssignmentList} from "./AssignmentSchedule";

interface HeaderProps {
    assignmentsSetByMe?: AssignmentDTO[];
    viewBy: "startDate" | "dueDate";
    setViewBy: (vb: "startDate" | "dueDate") => void;
    groupsToInclude: Item<number>[];
    setGroupsToInclude: (groups: Item<number>[]) => void;
    groups?: AppGroup[];
    user: RegisteredUserDTO;
    openAssignmentModal: (assignment?: ValidAssignmentWithListingDate) => void;
    collapse: () => void;
}

const AssignmentScheduleStickyHeader = ({user, groups, assignmentsSetByMe, viewBy, setViewBy, setGroupsToInclude, groupsToInclude, openAssignmentModal, collapse}: HeaderProps) => {

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
            };
            headerScrollerObserver.current = new IntersectionObserver(headerScrollerCallback, options);
            headerScrollerObserver.current.observe(headerScrollerSentinel.current);
            headerScrollerFlag.current = true;
            return () => {
                headerScrollerObserver?.current?.disconnect();
                headerScrollerObserver.current = undefined;
                headerScrollerFlag.current = false;
            };
        }
    }, [assignmentsSetByMe]);

    const header = <Card className={"container py-2 px-3 w-100"}>
        <Row>
            <Col xs={6}>
                {assignmentsSetByMe && assignmentsSetByMe.length > 0
                    ? <>
                        <Label className={"w-100"}>Filter by group:
                            <StyledSelect inputId="groups-filter" isMulti isClearable placeholder="All"
                                          value={groupsToInclude}
                                          closeMenuOnSelect={!isStaff(user)}
                                          onChange={selectOnChange(setGroupsToInclude, false)}
                                          options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
                            />
                        </Label>
                        <Button className={"mt-2 mt-sm-0"} size={"xs"} color={"link"} block onClick={() => {
                            collapse();
                            if (headerScrollerSentinel.current && headerScrollerSentinel.current.getBoundingClientRect().top < 0) {
                                headerScrollerSentinel.current?.scrollIntoView();
                            }
                        }}>
                            Collapse schedule
                        </Button>
                    </>
                    : <div className={"mt-2"}>You have no assignments</div>
                }
            </Col>
            <Col xs={6} className={"py-2"}>
                <Button size={"sm"} block onClick={() => openAssignmentModal()}>
                    <span className={"d-block d-md-none"}>Set assignment</span>
                    <span className={"d-none d-md-block"}>Set new assignment</span>
                </Button>
                {assignmentsSetByMe && assignmentsSetByMe.length > 0 && <>
                    <ButtonGroup className={"w-100 pt-3"}>
                        <Button size={"sm"} className={"border-right-0"} id={"start-date-button"}
                                color={viewBy === "startDate" ? "secondary" : "primary"}
                                outline={viewBy !== "startDate"}
                                onClick={() => setViewBy("startDate")}>
                            By start date
                        </Button>
                        <Button size={"sm"} className={"border-left-0"} id={"due-date-button"}
                                color={viewBy === "dueDate" ? "secondary" : "primary"}
                                outline={viewBy !== "dueDate"}
                                onClick={() => setViewBy("dueDate")}>
                            By due date
                        </Button>
                    </ButtonGroup>
                </>}
            </Col>
        </Row>
    </Card>;

    return <div className="no-print">
        <div id="header-sentinel" ref={headerScrollerSentinel}>&nbsp;</div>
        <div ref={stickyHeaderListContainer} id="stickyheader">
            {header}
        </div>
        {header}
    </div>;
}

interface AssignmentListEntryProps {
    assignment: ValidAssignmentWithListingDate;
}
const AssignmentListEntry = ({assignment}: AssignmentListEntryProps) => {
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const {openAssignmentModal, viewBy} = useContext(AssignmentScheduleContext);
    const [ unassignGameboard ] = useUnassignGameboardMutation();
    const deleteAssignment = () => {
        if (confirm(`Are you sure you want to unassign ${assignment.gameboard?.title ?? "this gameboard"} from ${assignment.groupName ? `group ${assignment.groupName}` : "this group"}?`)) {
            unassignGameboard({boardId: assignment.gameboardId, groupId: assignment.groupId});
        }
    };
    const assignmentOwnedByMe = assignment.ownerUserId === user.id;
    const assignmentStartDate = getAssignmentStartDate(assignment);
    const gameboardTitle = assignment.gameboard?.title ?? `No ${siteSpecific("gameboard", "quiz")} title`;
    const gameboardLink = assignment.gameboardId ? `${PATHS.GAMEBOARD}#${assignment.gameboardId}` : undefined;
    return <Card className={"my-1"}>
        <CardHeader className={"pt-2 pb-0 d-flex text-break"}>
            <h4><a target={"_blank"} rel={"noreferrer noopener"} href={gameboardLink}>{gameboardTitle}</a></h4>
            <div className={"ml-auto text-right"}>
                <Button color="link" size="sm" onClick={() => openAssignmentModal(assignment)}>
                    Copy
                </Button>
                {(assignmentOwnedByMe || assignment.additionalManagerPrivileges) && <Button color="link" size="sm" onClick={deleteAssignment}>
                    Delete
                </Button>}
            </div>
        </CardHeader>
        <CardBody>
            <div>Assigned to: <strong>{assignment.groupName}</strong></div>
            {assignmentStartDate && <div>Start date: <strong>{new Date(assignmentStartDate).toDateString()}</strong>{assignmentStartDate > TODAY().valueOf() && <span className={"text-muted"}> (not started)</span>}</div>}
            {assignment.dueDate && <div>Due date: <strong>{new Date(assignment.dueDate).toDateString()}</strong></div>}
            {assignment.gameboard && <div>Assigned by: <strong>{assignmentOwnedByMe ? "Me" : "Someone else"}</strong></div>}
            {assignment.gameboard && <div>Gameboard created by: <strong>{formatBoardOwner(user, assignment.gameboard)}</strong></div>}
            {assignment.listingDate <= TODAY() && <div>
                <a color="link" target={"_blank"} rel={"noreferrer noopener"} href={`${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}`}>
                    View assignment progress <span className={"sr-only"}>(opens in new tab)</span>
                </a>
            </div>}
        </CardBody>
    </Card>;
}

interface QuizAssignmentListEntryProps {
    assignment: ValidQuizAssignmentWithListingDate;
}
const QuizAssignmentListEntry = ({assignment}: QuizAssignmentListEntryProps) => {
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const {openAssignmentModal, viewBy, groupsById} = useContext(AssignmentScheduleContext);
    // const [ unassignGameboard ] = useUnassignGameboardMutation();
    // const deleteAssignment = () => {
    //     if (confirm(`Are you sure you want to unassign ${assignment.gameboard?.title ?? "this gameboard"} from ${assignment.groupName ? `group ${assignment.groupName}` : "this group"}?`)) {
    //         unassignGameboard({boardId: assignment.gameboardId, groupId: assignment.groupId});
    //     }
    // };
    const assignmentOwnedByMe = assignment.ownerUserId === user.id;
    const assignmentStartDate = getAssignmentStartDate(assignment);
    const quizTitle = assignment.quizSummary?.title ?? `No test title`;
    const group = groupsById[assignment.groupId];
    const previwLink = assignment.quizId ? `/test/preview/${assignment.quizId}` : undefined;
    return <Card className={"my-1"}>
        <CardHeader className={"pt-2 pb-0 d-flex text-break"}>
            <h4><a target={"_blank"} rel={"noreferrer noopener"} href={previwLink}>{quizTitle}</a></h4>
            {/*<div className={"ml-auto text-right"}>*/}
            {/*    <Button color="link" size="sm" onClick={() => openAssignmentModal(assignment)}>*/}
            {/*        Copy*/}
            {/*    </Button>*/}
            {/*    {assignmentOwnedByMe && <Button color="link" size="sm" onClick={deleteAssignment}>*/}
            {/*        Delete*/}
            {/*    </Button>}*/}
            {/*</div>*/}
        </CardHeader>
        <CardBody>
            <div>Assigned to: <strong>{group?.groupName}</strong></div>
            {assignmentStartDate && <div>Start date: <strong>{new Date(assignmentStartDate).toDateString()}</strong>{assignmentStartDate > TODAY().valueOf() && <span className={"text-muted"}> (not started)</span>}</div>}
            {assignment.dueDate && <div>Due date: <strong>{new Date(assignment.dueDate).toDateString()}</strong></div>}
            {assignment.quiz && <div>Assigned by: <strong>{assignmentOwnedByMe ? "Me" : "Someone else"}</strong></div>}
            {assignment.listingDate <= TODAY() && <div>
                <a color="link" target={"_blank"} rel={"noreferrer noopener"} href={`/test/assignment/${assignment.id}/feedback`}>
                    View test feedback <span className={"sr-only"}>(opens in new tab)</span>
                </a>
            </div>}
        </CardBody>
    </Card>;
}

interface AssignmentModalProps {
    user: RegisteredUserDTO;
    showAssignmentModal: boolean;
    toggleAssignModal: () => void;
    assignmentToCopy: AssignmentDTO | undefined;
}
const AssignmentModal = ({user, showAssignmentModal, toggleAssignModal, assignmentToCopy}: AssignmentModalProps) => {
    const dispatch = useAppDispatch();
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date>();
    const [scheduledStartDate, setScheduledStartDate] = useState<Date>();
    const [assignmentNotes, setAssignmentNotes] = useState<string>();

    const [showGameboardPreview, setShowGameboardPreview] = useState<boolean>(false);
    const toggleGameboardPreview = () => setShowGameboardPreview(o => !o);

    const [selectedGameboard, setSelectedGameboard] = useState<Item<string>[]>();

    const {boardsById, groups, gameboards, boardIdsByGroupId} = useContext(AssignmentScheduleContext);

    useEffect(() => {
        setSelectedGroups([]);
        if (assignmentToCopy && assignmentToCopy.gameboardId) {
            // Copy existing assignment
            setSelectedGameboard([{value: assignmentToCopy.gameboardId, label: boardsById[assignmentToCopy.gameboardId]?.title ?? "No gameboard title"}]);
            setScheduledStartDate(assignmentToCopy.scheduledStartDate ? new Date(assignmentToCopy.scheduledStartDate.valueOf()) : undefined);
            setDueDate(assignmentToCopy.dueDate ? new Date(assignmentToCopy.dueDate.valueOf()) : undefined);
            setAssignmentNotes(assignmentToCopy.notes);
        } else {
            // Create from scratch
            setSelectedGameboard(undefined);
            setScheduledStartDate(undefined);
            setDueDate(undefined);
            setAssignmentNotes(undefined);
        }
    }, [assignmentToCopy]);

    const assign = useCallback(() => {
        if (!selectedGameboard || !selectedGameboard[0]?.value) return;
        dispatch(assignGameboard({
            boardId: selectedGameboard[0]?.value,
            groups: [...selectedGroups],
            dueDate,
            scheduledStartDate: scheduledStartDate && nthHourOf(7, scheduledStartDate),
            notes: assignmentNotes
        })).then((result) => {
            if (assignGameboard.fulfilled.match(result)) {
                setSelectedGroups([]);
                setDueDate(undefined);
                setScheduledStartDate(undefined);
                setAssignmentNotes('');
            }
            // Fails silently if assignGameboard throws an error - we let it handle opening toasts for errors
        });
    }, [selectedGameboard, selectedGroups, dueDate,
        scheduledStartDate, assignmentNotes, setSelectedGroups,
        setDueDate, setScheduledStartDate, setAssignmentNotes]);

    const yearRange = range(currentYear, currentYear + 5);

    const dueDateInvalid = dueDate && scheduledStartDate ? scheduledStartDate.valueOf() > dueDate.valueOf() : false;

    useEffect(() => {
        if (showAssignmentModal) setShowGameboardPreview(false);
    }, [showAssignmentModal]);

    const alreadyAssignedGroupNames = useMemo<string[]>(() => {
        if (!selectedGameboard || selectedGameboard.length === 0 || !selectedGroups || selectedGroups.length === 0) return [];
        return selectedGroups.filter(g => g.value && boardIdsByGroupId[g.value]?.includes(selectedGameboard[0]?.value)).map(g => g.label);
    }, [selectedGroups, boardIdsByGroupId, selectedGameboard]);

    const gameboardToPreview = selectedGameboard?.[0]?.value ? boardsById[selectedGameboard[0].value] : undefined;

    return <Modal isOpen={showAssignmentModal} toggle={toggleAssignModal}>
        <ModalHeader close={
            <button className="close" onClick={toggleAssignModal}>
                Close
            </button>
        }>
            Set new assignment
        </ModalHeader>
        <ModalBody>
            <Label className="w-100 pb-2">Group(s):
                <StyledSelect inputId="groups-to-assign" isMulti isClearable placeholder="None"
                        value={selectedGroups}
                        closeMenuOnSelect={false}
                        onChange={selectOnChange(setSelectedGroups, false)}
                        options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
                />
            </Label>
            <Label className="w-100 pb-2">Gameboard:
                <StyledSelect inputId="gameboard-to-assign" isClearable placeholder="None"
                        value={selectedGameboard}
                        onChange={selectOnChange(setSelectedGameboard, false)}
                        options={gameboards.map(g => itemise(g.id ?? "", g.title ?? "No gameboard title"))}
                />
                {alreadyAssignedGroupNames && alreadyAssignedGroupNames.length > 0 && <Alert color={"warning"} className={"my-1"}>
                    This {siteSpecific("gameboard", "quiz")} is already assigned to group{alreadyAssignedGroupNames.length > 1 ? "s" : ""}: {alreadyAssignedGroupNames.join(", ")}. You must delete the previous assignment{alreadyAssignedGroupNames.length > 1 ? "s" : ""} to set it again.
                </Alert>}
                {selectedGameboard && selectedGameboard?.[0]?.value && boardsById[selectedGameboard[0].value] && boardsById[selectedGameboard[0].value]?.contents && <Card className={"my-1"} >
                    <CardHeader className={"text-right"}><Button color={"link"} onClick={toggleGameboardPreview}>{showGameboardPreview ? "Hide" : "Show"}{" "}{siteSpecific("gameboard", "quiz")} preview</Button></CardHeader>
                    {showGameboardPreview && gameboardToPreview && <GameboardViewerInner gameboard={gameboardToPreview}/>}
                    {showGameboardPreview && <CardFooter className={"text-right"}><Button color={"link"} onClick={toggleGameboardPreview}>Hide {siteSpecific("gameboard", "quiz")} preview</Button></CardFooter>}
                </Card>}
            </Label>
            <Label className="w-100 pb-2 mt-5">Schedule an assignment start date <span className="text-muted"> (optional)</span>
                <DateInput value={scheduledStartDate} placeholder="Select your scheduled start date..." yearRange={yearRange}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => setScheduledStartDate(e.target.valueAsDate as Date)} />
            </Label>
            <Label className="w-100 pb-2">Due date reminder <span className="text-muted"> (optional)</span>
                <DateInput value={dueDate} placeholder="Select your due date..." yearRange={yearRange}
                           onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.valueAsDate as Date)} />
                {dueDateInvalid && <small className={"pt-2 text-danger"}>Due date must be on or after start date.</small>}
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

type AssignmentsGroupedByDate = [number, [number, [number, (ValidAssignmentWithListingDate | ValidQuizAssignmentWithListingDate)[]][]][]][];
export const AssignmentSchedule = ({user}: {user: RegisteredUserDTO}) => {
    const assignmentsSetByMeQuery = useGetMySetAssignmentsQuery(undefined);
    const { data: quizzesSetByMe } = useGetMySetQuizzesQuery();
    const { data: assignmentsSetByMe } = assignmentsSetByMeQuery;
    const { data: gameboards } = useGetGameboardsQuery({startIndex: 0, limit: BoardLimit.All, sort: BoardOrder.created});
    const { data: groups } = useGetGroupsQuery(false);

    const [viewBy, setViewBy] = useState<"startDate" | "dueDate">("startDate");

    // Empty list means all groups are included, non-empty means only those in the list are included
    const [groupsToInclude, setGroupsToInclude] = useState<Item<number>[]>([]);

    // --- Slow-to-calculate constant lookup maps for ease of locating gameboards, groups, etc. ---

    const boardsById = useMemo<{[id: string]: GameboardDTO | undefined}>(() => {
        return gameboards?.boards.reduce((acc, b) => b.id ? {...acc, [b.id]: b} : acc, {} as {[id: string]: GameboardDTO}) ?? {};
    }, [gameboards]);

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
        }, {} as {[id: number]: string[]}) ?? {}
    }, [assignmentsSetByMe]);

    // Logic to handle showing older assignments - we show the "load older assignments" button if we haven't shown
    // the oldest assignment yet
    const [earliestShowDate, setEarliestShowDate] = useState<Date>(() => {
        let d = new Date();
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
        )
        , [assignmentsSetByMe, groupFilter, viewBy]);
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
        if (!assignmentsSetByMe || !quizzesSetByMe || (assignmentsSetByMe.length === 0 && quizzesSetByMe.length === 0)) return [];
        const assignments = assignmentsSetByMe
            .map((a) => ({...a, listingDate: new Date(viewBy === "startDate" ? getAssignmentStartDate(a) : (a.dueDate ?? 0).valueOf()), additionalManagerPrivileges: (a?.groupId && groupsById[a.groupId]?.additionalManagerPrivileges) ?? false} as ValidAssignmentWithListingDate))
            // IMPORTANT - filter ensures that id, gameboard id, and group id exist so the cast to ValidAssignmentWithListingDate was/will be valid
            .filter(a => a.id && a.gameboardId && a.groupId && groupFilter[a.groupId] && (viewBy === "startDate" || isDefined(a.dueDate)));
        const quizAssignments = quizzesSetByMe
            .map((a) => ({...a, listingDate: new Date(viewBy === "startDate" ? getAssignmentStartDate(a) : (a.dueDate ?? 0).valueOf())} as ValidQuizAssignmentWithListingDate))
            // IMPORTANT - filter ensures that id, gameboard id, and group id exist so the cast to ValidAssignmentWithListingDate was/will be valid
            .filter(a => a.id && a.quizId && a.groupId && groupFilter[a.groupId] && (viewBy === "startDate" || isDefined(a.dueDate)))
        const sortedAssignments: (ValidAssignmentWithListingDate | ValidQuizAssignmentWithListingDate)[] = sortBy(
            [...assignments, ...quizAssignments]
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
    }, [assignmentsSetByMe, quizzesSetByMe, groupFilter, earliestShowDate, viewBy]);

    const notAllPastAssignmentsAreListed = earliestShowDate.valueOf() >= oldestAssignmentDate.valueOf();

    // Modal logic
    const [assignmentToCopy, setAssignmentToCopy] = useState<AssignmentDTO | undefined>();
    const {hash} = useLocation();
    const gameboardId = hash.includes("#") ? hash.slice(1) : undefined;
    const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
    const openAssignmentModal = useCallback((assignment?: ValidAssignmentWithListingDate) => {
        setAssignmentToCopy(assignment);
        setShowAssignmentModal(true);
    }, [setAssignmentToCopy, setShowAssignmentModal]);
    useEffect(() => {
        if (gameboardId) {
            setAssignmentToCopy({gameboardId});
            setShowAssignmentModal(true);
        }
    }, []);
    const toggleAssignModal = () => setShowAssignmentModal(o => !o);

    // Flag to notify children components to completely collapse all assignment sub-lists, so only months are showing
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const pageHelp = <span>
        Use this page to set and manage assignments to your groups. You can assign any {siteSpecific("gameboard", "quiz")} you have saved to your account.
        <br/>
        Students in the group will be emailed when you set a new assignment.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="Assignment Schedule" help={pageHelp}/>
        {/*<h4 className="mt-4 mb-3">*/}
        {/*    Assign a {siteSpecific("gameboard", "quiz")} from...*/}
        {/*</h4>*/}
        <PhyAddGameboardButtons className="mb-4" redirectBackTo="/assignment_schedule"/>
        <ShowLoadingQuery
            defaultErrorTitle="Error loading assignments and/or gameboards"
            query={assignmentsSetByMeQuery}
        >
            <AssignmentScheduleContext.Provider value={{boardsById, groupsById, groupFilter, boardIdsByGroupId, groups: groups ?? [], gameboards: gameboards?.boards ?? [], openAssignmentModal, collapsed, setCollapsed, viewBy}}>
                <div className="px-md-4 pl-2 pr-2 timeline-column mb-4 pt-2">
                    {!isStaff(user) && <Alert className="mt-2" color="info">
                        The Assignment Schedule page is an alternate way to manage your assignments, focusing on the start and due dates of the assignments, rather than the assigned gameboard.
                        <br/>
                        It is a work in progress, and we would love to <a target="_blank" href="/contact?subject=Assignment%20Schedule%20Feedback">hear your feedback</a>!
                    </Alert>}
                    <AssignmentScheduleStickyHeader
                        assignmentsSetByMe={assignmentsSetByMe}
                        groupsToInclude={groupsToInclude} setGroupsToInclude={setGroupsToInclude}
                        viewBy={viewBy} setViewBy={setViewBy}
                        openAssignmentModal={openAssignmentModal} collapse={() => setCollapsed(true)}
                        groups={groups} user={user}
                    />
                    <Card className="mt-2">
                        <CardBody className="pt-0">
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
                                        <div className="year-label w-100 text-right">
                                            <h3 className="mb-n3">{`${y}`}</h3>
                                            <hr className="ml-4"/>
                                        </div>
                                        {ms.map(([m, ds]) => <MonthAssignmentList key={m} month={m} datesAndAssignments={ds}/>)}
                                    </Fragment>
                                )}
                                <div className={classNames("bg-timeline", {"fade-in": !notAllPastAssignmentsAreListed})}/>
                            </div>}
                        </CardBody>
                    </Card>
                </div>
                <AssignmentModal
                    user={user}
                    showAssignmentModal={showAssignmentModal}
                    toggleAssignModal={toggleAssignModal}
                    assignmentToCopy={assignmentToCopy}
                />
            </AssignmentScheduleContext.Provider>
        </ShowLoadingQuery>
    </Container>;
}
