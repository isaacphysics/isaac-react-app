import {
    assignGameboard,
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetGameboardsQuery,
    useGetGroupsQuery,
    useGetMySetAssignmentsQuery,
    useLazyGetGameboardByIdQuery,
    useUnassignGameboardMutation
} from "../../state";
import {AssignmentDTO, ContentSummaryDTO, GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import range from "lodash/range";
import sortBy from "lodash/sortBy";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import React, {ChangeEvent, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
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
    Row,
    Table
} from "reactstrap";
import {
    above,
    BoardLimit,
    convertGameboardItemToContentSummary,
    determineGameboardStagesAndDifficulties,
    determineGameboardSubjects,
    difficultyShortLabelMap,
    formatBoardOwner,
    getAssignmentStartDate,
    isAda,
    isDefined,
    isStaff,
    Item,
    itemise,
    MONTH_NAMES,
    nthHourOf,
    PATHS,
    selectOnChange,
    siteSpecific,
    stageLabelMap,
    TAG_ID,
    TAG_LEVEL,
    tags,
    TODAY,
    useDeviceSize,
    UTC_MIDNIGHT_IN_SIX_DAYS
} from "../../services";
import {
    AppGroup,
    AssignmentBoardOrder,
    AssignmentScheduleContext,
    ValidAssignmentWithListingDate
} from "../../../IsaacAppTypes";
import {calculateHexagonProportions, Hexagon} from "../elements/svg/Hexagon";
import classNames from "classnames";
import {currentYear, DateInput} from "../elements/inputs/DateInput";
import {Link, useLocation} from "react-router-dom";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {formatDate} from "../elements/DateString";
import { ListView } from "../elements/list-groups/ListView";

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
    const deviceSize = useDeviceSize();

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
    };
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
                {/*<Button size={"sm"} block onClick={() => openAssignmentModal()}>*/}
                {/*    <span className={"d-block d-md-none"}>Set assignment</span>*/}
                {/*    <span className={"d-none d-md-block"}>Set new assignment</span>*/}
                {/*</Button>*/}
                {assignmentsSetByMe && assignmentsSetByMe.length > 0 && <>
                    <ButtonGroup className={"w-100 pt-3"}>
                        <Button size={above["lg"](deviceSize) ? "md" : "sm"} className={"border-end-0 px-1 px-lg-3"} id={"start-date-button"}
                            color={viewBy === "startDate" ? "solid" : "keyline"}
                            onClick={() => setViewBy("startDate")}
                        >
                            By start date
                        </Button>
                        <Button size={above["lg"](deviceSize) ? "md" : "sm"} className={"border-start-0 px-1 px-lg-3"} id={"due-date-button"}
                            color={viewBy === "dueDate" ? "solid" : "keyline"}
                            onClick={() => setViewBy("dueDate")}
                        >
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
};

interface AssignmentListEntryProps {
    assignment: ValidAssignmentWithListingDate;
}
const AssignmentListEntry = ({assignment}: AssignmentListEntryProps) => {
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const {openAssignmentModal, boardsById} = useContext(AssignmentScheduleContext);
    const [ unassignGameboard ] = useUnassignGameboardMutation();
    const [showMore, setShowMore] = useState(false);
    const [showGameboardPreview, setShowGameboardPreview] = useState(false);
    const deleteAssignment = () => {
        if (confirm(`Are you sure you want to unassign ${assignment.gameboard?.title ?? `this ${siteSpecific("question deck", "quiz")}`} from ${assignment.groupName ? `group ${assignment.groupName}` : "this group"}?`)) {
            unassignGameboard({boardId: assignment.gameboardId, groupId: assignment.groupId});
        }
    };
    const assignmentOwnedByMe = assignment.ownerUserId === user.id;
    const assignmentStartDate = getAssignmentStartDate(assignment);
    const gameboardLink = assignment.gameboardId ? `${PATHS.GAMEBOARD}#${assignment.gameboardId}` : undefined;
    const gameboardTitle = assignment.gameboard?.title ?? `Unknown ${siteSpecific("question deck", "quiz")} (may belong to another user)`;
    const gameboard = boardsById[assignment.gameboardId];
    const boardSubjects = determineGameboardSubjects(gameboard);

    // This logic means that even if a user doesn't have a gameboard saved to their account, they can still preview it.
    // Very useful for copying assignments from other users.
    const [getGameboardById, {currentData: gameboardSearch, isLoading, isFetching, }] = useLazyGetGameboardByIdQuery();
    let gameboardToPreview = gameboard;
    if (!gameboardToPreview) {
        if (gameboardSearch?.id === assignment.gameboardId) {
            gameboardToPreview = gameboardSearch;
        } else if (!isLoading && !isFetching) {
            getGameboardById(assignment.gameboardId);
        }
    }

    const boardStagesAndDifficulties = determineGameboardStagesAndDifficulties(gameboardToPreview);

    return <Card className={"my-1"}>
        <CardHeader className={"pt-2 pb-0 d-flex text-break"}>
            <h4><a target={"_blank"} rel={"noreferrer noopener"} href={gameboardLink}>{gameboardTitle}</a></h4>
            <div className={"ms-auto text-end"}>
                <Button color="link" size="sm" onClick={() => openAssignmentModal(assignment)}>
                    Set again
                </Button>
                {(assignmentOwnedByMe || assignment.additionalManagerPrivileges) && <Button color="link" size="sm" onClick={deleteAssignment}>
                    Unassign
                </Button>}
            </div>
        </CardHeader>
        <CardBody>
            <div>Assigned to: <strong>{assignment.groupName}</strong></div>
            {assignmentStartDate && <div>Start date: <strong>{new Date(assignmentStartDate).toDateString()}</strong>{assignmentStartDate > TODAY().valueOf() && <span className={"text-muted"}> (not started)</span>}</div>}
            {assignment.dueDate && <div>Due date: <strong>{new Date(assignment.dueDate).toDateString()}</strong></div>}
            {showMore && <>
                {assignment.notes && <div>
                    Notes
                    <div className={"ms-1 mt-1 mb-2 ps-3 border-start"}>{assignment.notes}</div>
                </div>}
                <div>Assigned by: <strong>{assignmentOwnedByMe ? "Me" : "Someone else"}</strong></div>
                {assignment.gameboard && <div className={"mt-2 border-top pt-2"}>
                    <Row>
                        <Col xs={12} md={boardStagesAndDifficulties.length === 0 ? 12 : 6}>
                            <div>Question deck: <strong><a target={"_blank"} rel={"noreferrer noopener"} href={gameboardLink}>{gameboardTitle} <span className={"visually-hidden"}>(opens in new tab)</span></a></strong></div>
                            <div>Question deck created by: <strong>{formatBoardOwner(user, assignment.gameboard)}</strong></div>
                            <div className={"mb-1"}>Subject(s): <strong>{boardSubjects.map(subj => tags.getSpecifiedTag(TAG_LEVEL.subject, [subj as TAG_ID])?.title).join(", ")}</strong></div>
                        </Col>
                        {boardStagesAndDifficulties.length > 0 && <Col xs={12} md={6}>
                            <Table>
                                <thead>
                                    <tr>
                                        <th className="border-top-0 fw-normal py-1">
                                            {`Stage${boardStagesAndDifficulties.length > 1 ? "s" : ""}`}
                                        </th>
                                        <th className="border-top-0 fw-normal py-1">
                                            {`Difficult${boardStagesAndDifficulties.some(([, ds]) => ds.length > 1) ? "ies" : "y"}`}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boardStagesAndDifficulties.map(([stage, difficulties]) => <tr key={stage}>
                                        <td className="py-1">
                                            <strong>{stageLabelMap[stage]}</strong>
                                        </td>
                                        <td className="py-1">
                                            <strong>{difficulties.map((d) => difficultyShortLabelMap[d]).join(", ")}</strong>
                                        </td>
                                    </tr>)}
                                </tbody>
                            </Table>
                        </Col>}
                    </Row>
                    {gameboardToPreview && <GameboardPreviewCard showGameboardPreview={showGameboardPreview} toggleGameboardPreview={() => setShowGameboardPreview(p => !p)} gameboardToPreview={gameboardToPreview} />}
                </div>}
            </>}
        </CardBody>
        <CardFooter className={"assignment-card-footer border-top-0 pt-0"}>
            <a className={"me-3"} href="#" color="link" role="button" onClick={(e) => {
                e.preventDefault();
                setShowMore(sm => !sm);
            }}>
                Show {showMore ? "less" : "more"}
            </a>
            {assignment.listingDate <= TODAY() &&
                <a color="link" target={"_blank"} rel={"noreferrer noopener"} href={`${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}`}>
                    View assignment progress <span className={"visually-hidden"}>(opens in new tab)</span>
                </a>}
        </CardFooter>
    </Card>;
};

// If the hexagon proportions change, the CSS class bg-timeline needs revisiting
const dateHexagon = calculateHexagonProportions(20, 1);
const DateAssignmentList = ({date, assignments}: {date: number; assignments: ValidAssignmentWithListingDate[]}) => {
    const [open, setOpen] = useState<boolean>(false);
    const {boardsById, collapsed, setCollapsed, viewBy} = useContext(AssignmentScheduleContext);
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
            {assignments.map(a => <AssignmentListEntry key={a.id} assignment={{...a, gameboard: a.gameboard ?? (a.gameboardId ? boardsById[a.gameboardId] : undefined)}}/> )}
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
    const {collapsed, setCollapsed, viewBy} = useContext(AssignmentScheduleContext);
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

const GameboardPreviewCard = ({showGameboardPreview, toggleGameboardPreview, gameboardToPreview}: {showGameboardPreview: boolean, toggleGameboardPreview: () => void, gameboardToPreview: GameboardDTO}) => {
    const displayQuestions: ContentSummaryDTO[] = gameboardToPreview?.contents?.map(q => { return {...convertGameboardItemToContentSummary(q), state: q.state}; }) || [];

    return displayQuestions.length > 0 && <Card className="my-1">
        <CardHeader className="text-end">
            <Button color={"link"} onClick={toggleGameboardPreview}>
                {showGameboardPreview ? "Hide " : "Show "}{siteSpecific("question deck", "quiz")} preview
            </Button>
        </CardHeader>
        {showGameboardPreview && <>
            <ListView type="item" items={displayQuestions} linkedBoardId={gameboardToPreview.id} hasCaret={isAda}/>
            <CardFooter className="text-end">
                <Button color={"link"} onClick={toggleGameboardPreview}>
                    Hide {siteSpecific("question deck", "quiz")} preview
                </Button>
            </CardFooter>
        </>}
    </Card>;
};

interface AssignmentModalProps {
    user: RegisteredUserDTO;
    showSetAssignmentUI: boolean;
    toggleSetAssignmentUI: () => void;
    assignmentToCopy: AssignmentDTO | undefined;
}
const AssignmentModal = ({user, showSetAssignmentUI, toggleSetAssignmentUI, assignmentToCopy}: AssignmentModalProps) => {
    const dispatch = useAppDispatch();
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date>();
    const [scheduledStartDate, setScheduledStartDate] = useState<Date>();
    const [assignmentNotes, setAssignmentNotes] = useState<string>();
    const [showGameboardPreview, setShowGameboardPreview] = useState<boolean>(false);
    const [selectedGameboard, setSelectedGameboard] = useState<Item<string>[]>();

    const {boardsById, groups, gameboards, boardIdsByGroupId} = useContext(AssignmentScheduleContext);

    useEffect(() => {
        setSelectedGroups([]);
        if (assignmentToCopy && assignmentToCopy.gameboardId) {
            const displayTitle = (assignmentToCopy.gameboard?.title ?? boardsById[assignmentToCopy.gameboardId]?.title ?? `Unknown ${siteSpecific("question deck", "quiz")}`) + (assignmentToCopy.gameboard?.ownerUserId === user.id ? "" : ` (belongs to another user)`);
            // Copy existing assignment
            setSelectedGameboard([{value: assignmentToCopy.gameboardId, label: displayTitle}]);
            setScheduledStartDate(assignmentToCopy.scheduledStartDate ? new Date(assignmentToCopy.scheduledStartDate.valueOf()) : undefined);
            setDueDate(assignmentToCopy.dueDate ? new Date(assignmentToCopy.dueDate.valueOf()) : undefined);
            setAssignmentNotes(assignmentToCopy.notes);
        } else {
            // Create from scratch
            setSelectedGameboard(undefined);
            setScheduledStartDate(undefined);
            setDueDate(UTC_MIDNIGHT_IN_SIX_DAYS);
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
            notes: assignmentNotes,
            userId: user.id
        })).then((result) => {
            if (assignGameboard.fulfilled.match(result)) {
                setSelectedGroups([]);
                setScheduledStartDate(undefined);
                setDueDate(UTC_MIDNIGHT_IN_SIX_DAYS);
                setAssignmentNotes('');
            }
            // Fails silently if assignGameboard throws an error - we let it handle opening toasts for errors
        });
    }, [selectedGameboard, selectedGroups, dueDate,
        scheduledStartDate, assignmentNotes, setSelectedGroups,
        setDueDate, setScheduledStartDate, setAssignmentNotes]);

    const yearRange = range(currentYear, currentYear + 5);

    const dueDateInvalid = isDefined(dueDate) && ((scheduledStartDate ? (nthHourOf(0, scheduledStartDate).valueOf() > dueDate.valueOf()) : false) || TODAY().valueOf() > dueDate.valueOf());

    useEffect(() => {
        if (showSetAssignmentUI) setShowGameboardPreview(false);
    }, [showSetAssignmentUI]);

    const alreadyAssignedGroupNames = useMemo<string[]>(() => {
        if (!selectedGameboard || selectedGameboard.length === 0 || !selectedGroups || selectedGroups.length === 0) return [];
        return selectedGroups.filter(g => g.value && boardIdsByGroupId[g.value]?.includes(selectedGameboard[0]?.value)).map(g => g.label);
    }, [selectedGroups, boardIdsByGroupId, selectedGameboard]);

    // This logic means that even if a user doesn't have a gameboard saved to their account, they can still preview it.
    // Very useful for copying assignments from other users.
    const [getGameboardById, {currentData: gameboardSearch, isLoading, isFetching, }] = useLazyGetGameboardByIdQuery();
    let gameboardToPreview = undefined;
    if (selectedGameboard?.[0]?.value) {
        gameboardToPreview = boardsById[selectedGameboard[0].value];
        if (!gameboardToPreview) {
            if (gameboardSearch?.id === selectedGameboard[0].value) {
                gameboardToPreview = gameboardSearch;
            } else if (!isLoading && !isFetching) {
                getGameboardById(selectedGameboard[0].value);
            }
        }
    }
    
    return <>
        <h3>
            Set new assignment{assignmentToCopy ? " (from existing)" : ""}
        </h3>
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
                options={gameboards.map(g => itemise(g.id ?? "", g.title ?? `Unknown ${siteSpecific("question deck", "quiz")} (may belong to another user)`))}
            />
            {alreadyAssignedGroupNames && alreadyAssignedGroupNames.length > 0 && <Alert color={"warning"} className={"my-1"}>
                This {siteSpecific("question deck", "quiz")} is already assigned to group{alreadyAssignedGroupNames.length > 1 ? "s" : ""}: {alreadyAssignedGroupNames.join(", ")}. You must delete the previous assignment{alreadyAssignedGroupNames.length > 1 ? "s" : ""} to set it again.
            </Alert>}
            {gameboardToPreview && <GameboardPreviewCard showGameboardPreview={showGameboardPreview} toggleGameboardPreview={() => setShowGameboardPreview(p => !p)} gameboardToPreview={gameboardToPreview} />} 
        </Label>
        <Label className="w-100 pb-2">Schedule an assignment start date <span className="text-muted"> (optional)</span>
            <DateInput value={scheduledStartDate} placeholder="Select your scheduled start date..." yearRange={yearRange}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setScheduledStartDate(e.target.valueAsDate as Date)}
            />
        </Label>
        <Label className="w-100 pb-2">Due date reminder
            <DateInput value={dueDate} placeholder="Select your due date..." yearRange={yearRange}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.valueAsDate as Date)}
            />
            {!dueDate && <small className={"pt-2 text-danger"}>Since January 2025, due dates are required for assignments.</small>}
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
        <Row className={"mt-3"}>
            <Col xs={12} sm={6}>
                <Button block color="keyline" className="w-100" onClick={toggleSetAssignmentUI}>Back to schedule</Button>
            </Col>
            <Col xs={12} sm={6}>
                <Button
                    className="mb-2 mb-sm-0 w-100"
                    block color="solid"
                    onClick={assign}
                    disabled={selectedGroups.length === 0 || (isDefined(assignmentNotes) && assignmentNotes.length > 500) || !isDefined(selectedGameboard) || alreadyAssignedGroupNames.length === selectedGroups.length || !dueDate || dueDateInvalid}
                >
                    Assign to group{selectedGroups.length > 1 ? "s" : ""}
                </Button>
            </Col>
        </Row>
    </>;
};

type AssignmentsGroupedByDate = [number, [number, [number, ValidAssignmentWithListingDate[]][]][]][];
export const AssignmentSchedule = ({user}: {user: RegisteredUserDTO}) => {
    const assignmentsSetByMeQuery = useGetMySetAssignmentsQuery(undefined);
    const { data: assignmentsSetByMe } = assignmentsSetByMeQuery;
    const { data: gameboards } = useGetGameboardsQuery({startIndex: 0, limit: BoardLimit.All, sort: AssignmentBoardOrder.created});
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

    // Modal logic
    const [assignmentToCopy, setAssignmentToCopy] = useState<AssignmentDTO | undefined>();
    const {hash} = useLocation();
    const gameboardId = hash.includes("#") ? hash.slice(1) : undefined;
    const [showSetAssignmentUI, setShowSetAssignmentUI] = useState<boolean>(false);
    const openAssignmentModal = useCallback((assignment?: ValidAssignmentWithListingDate) => {
        setAssignmentToCopy(assignment);
        setShowSetAssignmentUI(true);
    }, [setAssignmentToCopy, setShowSetAssignmentUI]);
    useEffect(() => {
        if (gameboardId) {
            setAssignmentToCopy({gameboardId});
            setShowSetAssignmentUI(true);
        }
    }, []);
    const toggleSetAssignmentUI = () => setShowSetAssignmentUI(o => !o);

    // Flag to notify children components to completely collapse all assignment sub-lists, so only months are showing
    const [collapsed, setCollapsed] = useState<boolean>(false);

    // const pageHelp = <span>
    //     Use this page to set and manage assignments to your groups. You can assign any {siteSpecific("question deck", "quiz")} you have saved to your account.
    //     <br/>
    //     Students in the group will be emailed when you set a new assignment.
    // </span>;
    const pageHelp = <span>
        Use this page to manage assignments for your groups, and view them as a timeline. You can unassign work, and assign existing assignments to other groups.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="Assignment schedule" icon={{type: "icon", icon: "icon-events"}} help={pageHelp}/>
        {/*<h4 className="mt-4 mb-3">*/}
        {/*    Assign a {siteSpecific("question deck", "quiz")} from...*/}
        {/*</h4>*/}
        {/*<PhyAddGameboardButtons className="mb-4" redirectBackTo="/assignment_schedule"/>*/}
        <ShowLoadingQuery
            defaultErrorTitle="Error loading assignments and/or question decks"
            query={assignmentsSetByMeQuery}
        >
            <AssignmentScheduleContext.Provider value={{boardsById, groupsById, groupFilter, boardIdsByGroupId, groups: groups ?? [], gameboards: gameboards?.boards ?? [], openAssignmentModal, collapsed, setCollapsed, viewBy}}>
                <div className="px-md-4 ps-2 pe-2 timeline-column mb-4 pt-2">
                    {!showSetAssignmentUI && <AssignmentScheduleStickyHeader
                        assignmentsSetByMe={assignmentsSetByMe}
                        groupsToInclude={groupsToInclude} setGroupsToInclude={setGroupsToInclude}
                        viewBy={viewBy} setViewBy={setViewBy}
                        openAssignmentModal={openAssignmentModal} collapse={() => setCollapsed(true)}
                        groups={groups} user={user}
                    />}
                    <Card className="mt-2">
                        <CardBody hidden={showSetAssignmentUI}>
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
                        <CardBody className="pt-3" hidden={!showSetAssignmentUI}>
                            <AssignmentModal
                                user={user}
                                showSetAssignmentUI={showSetAssignmentUI}
                                toggleSetAssignmentUI={toggleSetAssignmentUI}
                                assignmentToCopy={assignmentToCopy}
                            />
                        </CardBody>
                    </Card>
                </div>
            </AssignmentScheduleContext.Provider>
        </ShowLoadingQuery>
    </Container>;
};
