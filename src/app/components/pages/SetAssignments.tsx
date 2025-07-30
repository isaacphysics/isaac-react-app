import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Input,
    Label,
    Row,
    Spinner,
    Table,
    UncontrolledTooltip
} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {
    assignGameboard,
    closeActiveModal,
    openActiveModal,
    openIsaacBooksModal,
    selectors,
    setAssignBoardPath,
    useAppDispatch,
    useAppSelector,
    useGetGroupsQuery,
    useGetMySetAssignmentsQuery,
    useUnassignGameboardMutation
} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import range from "lodash/range";
import sortBy from "lodash/sortBy";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {currentYear, DateInput} from "../elements/inputs/DateInput";
import {
    above,
    BOARD_ORDER_NAMES,
    BoardCreators,
    BoardLimit,
    BoardSubjects,
    BoardViews,
    determineGameboardSubjects,
    difficultiesOrdered,
    difficultyShortLabelMap,
    formatBoardOwner,
    isAda,
    isDefined,
    isPhy,
    isEventLeaderOrStaff,
    Item,
    itemise,
    matchesAllWordsInAnyOrder,
    nthHourOf,
    PATHS,
    selectOnChange,
    siteSpecific,
    useDeviceSize,
    useGameboards,
    TODAY,
    UTC_MIDNIGHT_IN_SIX_DAYS
} from "../../services";
import {Loading} from "../handlers/IsaacSpinner";
import {AssignmentDTO, GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import {BoardAssignee, AssignmentBoardOrder, Boards, ActiveModal} from "../../../IsaacAppTypes";
import {BoardCard} from "../elements/cards/BoardCard";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import {SortItemHeader} from "../elements/SortableItemHeader";
import {MainContent, SetAssignmentsSidebar, SidebarLayout} from "../elements/layout/SidebarLayout";
import {HorizontalScroller} from "../elements/inputs/HorizontalScroller";
import classNames from "classnames";
import {PromptBanner} from "../elements/cards/PromptBanner";
import { PageMetadata } from "../elements/PageMetadata";
import { filter } from "lodash";

interface AssignGroupProps {
    groups: UserGroupDTO[];
    board: GameboardDTO | undefined;
    closeModal: () => void;
}

const AssignGroup = ({groups, board, closeModal}: AssignGroupProps) => {
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>(UTC_MIDNIGHT_IN_SIX_DAYS);
    const [scheduledStartDate, setScheduledStartDate] = useState<Date>();
    const [assignmentNotes, setAssignmentNotes] = useState<string>();
    const user = useAppSelector(selectors.user.loggedInOrNull);
    const dispatch = useAppDispatch();

    if (!board) return <Loading/>;

    function assign() {
        dispatch(assignGameboard({
            boardId: board?.id as string,
            groups: selectedGroups,
            dueDate,
            scheduledStartDate,
            notes: assignmentNotes,
            userId: user?.id
        })).then(success => {
            if (success) {
                setSelectedGroups([]);
                setDueDate(UTC_MIDNIGHT_IN_SIX_DAYS);
                setScheduledStartDate(undefined);
                setAssignmentNotes('');
                closeModal();
            }
        });
    }

    const yearRange = range(currentYear, currentYear + 5);
    const dueDateInvalid = isDefined(dueDate) && ((scheduledStartDate ? (nthHourOf(0, scheduledStartDate).valueOf() > dueDate.valueOf()) : false) || TODAY().valueOf() > dueDate.valueOf());
    const startDateInvalid = scheduledStartDate ? TODAY().valueOf() > scheduledStartDate.valueOf() : false;

    function setScheduledStartDateAtSevenAM(e: ChangeEvent<HTMLInputElement>) {
        const utcDate = e.target.valueAsDate;
        if (utcDate) {
            const scheduledDate = new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate(), 7);
            // Sets the scheduled date to 7AM in the timezone of the browser.
            setScheduledStartDate(scheduledDate);
        } else {
            setScheduledStartDate(null as unknown as Date);
            {/* DANGER here with force-casting Date|null to Date */
            }
        }
    }

    return <Container fluid className="py-2">
        <Label data-testid="modal-groups-selector" className="w-100 pb-2">Group(s):
            <StyledSelect inputId="groups-to-assign" isMulti isClearable placeholder="None"
                value={selectedGroups}
                closeMenuOnSelect={false}
                onChange={selectOnChange(setSelectedGroups, false)}
                options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
            />
        </Label>
        <Label className="w-100 pb-2">Schedule an assignment start date <span className="text-muted"> (optional)</span>
            <DateInput value={scheduledStartDate} placeholder="Select your scheduled start date..."
                yearRange={yearRange}
                onChange={setScheduledStartDateAtSevenAM}/>
            {startDateInvalid && <small className={"pt-2 text-danger"}>Start date must be in the future.</small>}
        </Label>
        <Label className="w-100 pb-2">Due date reminder
            <DateInput value={dueDate} placeholder="Select your due date..." yearRange={yearRange}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.valueAsDate as Date)}/> {/* DANGER here with force-casting Date|null to Date */}
            {!dueDate &&
                <small className={"pt-2 text-danger"}>Since {siteSpecific("Jan", "January")} 2025, due dates are
                    required for assignments.</small>}
            {dueDateInvalid && <small className={"pt-2 text-danger"}>Due date must be on or after start date and in the
                future.</small>}
        </Label>
        {isEventLeaderOrStaff(user) && <Label className="w-100 pb-2">Notes (optional):
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
            block color={siteSpecific("keyline", "solid")}
            onClick={assign}
            role={"button"}
            disabled={selectedGroups.length === 0 || (isDefined(assignmentNotes) && assignmentNotes.length > 500) || !dueDate || dueDateInvalid || startDateInvalid}
        >Assign to group{selectedGroups.length > 1 ? "s" : ""}</Button>
    </Container>;
};

type SetAssignmentsModalProps = {
    board: GameboardDTO | undefined;
    assignees: BoardAssignee[];
    groups: UserGroupDTO[];
    toggle: () => void;
    unassignBoard: (props: { boardId: string, groupId: number }) => void;
};

export const SetAssignmentsModal = (props: SetAssignmentsModalProps): ActiveModal => {
    const {board, assignees, toggle, unassignBoard} = props;

    const hasStarted = (a: { startDate?: Date | number }) => !a.startDate || (Date.now() > a.startDate.valueOf());

    const startedAssignees = assignees.filter(hasStarted);
    const scheduledAssignees = assignees.filter(a => !hasStarted(a));

    function confirmUnassignBoard(groupId: number, groupName?: string) {
        if (board?.id && confirm(`Are you sure you want to unassign this ${siteSpecific("question deck", "quiz")} from ${groupName ? `group ${groupName}` : "this group"}?`)) {
            unassignBoard({boardId: board?.id, groupId});
        }
    }

    const description = "Scheduled assignments appear to students on the morning of the day chosen, otherwise assignments appear immediately. " +
        "Assignments are due by the end of the day indicated.";

    return {
        closeAction: toggle,
        size: "md",
        title: board?.title,
        body: <>
            <p className="px-1">{description}</p>
            <hr className="text-center"/>
            <AssignGroup closeModal={toggle} {...props} />
            <hr className="text-center"/>
            <div className="py-2 border-bottom d-flex flex-column" data-testid="currently-assigned-to">
                <span>{siteSpecific("Question deck", "Quiz")} currently assigned to:</span>
                {startedAssignees.length > 0
                    ? <ul className="p-2 mb-3">{startedAssignees.map(assignee =>
                        <li data-testid={"current-assignment"} key={assignee.groupId}
                            className="px-1 d-flex justify-content-between">
                            <span className="flex-grow-1">{assignee.groupName}</span>
                            <button className="close" aria-label="Unassign group"
                                onClick={() => confirmUnassignBoard(assignee.groupId, assignee.groupName)}>×
                            </button>
                        </li>
                    )}</ul>
                    : <p className="px-2">No groups.</p>}
            </div>
            <div className="py-2 d-flex flex-column">
                <span className={classNames("mb-2", siteSpecific("d-flex align-items-center", ""))}>
                    Pending {siteSpecific("assignments", "quiz assignments")}:
                    <i className={siteSpecific("icon icon-info icon-color-grey ms-2", "icon-help mx-1")}
                        id={`pending-assignments-help-${board?.id}`}/>
                </span>
                <UncontrolledTooltip placement="left" autohide={false} target={`pending-assignments-help-${board?.id}`}>
                    These {siteSpecific("assignments", "quizzes")} are scheduled to begin at a future date. On the
                    morning of the scheduled date, students
                    will be able to see the {siteSpecific("assignment", "quiz")}, and will receive a notification email.
                </UncontrolledTooltip>
                {scheduledAssignees.length > 0
                    ? <ul className="p-2 mb-3">{scheduledAssignees.map(assignee =>
                        <li data-testid={"pending-assignment"} key={assignee.groupId}
                            className="px-1 d-flex justify-content-between">
                            <span className="flex-grow-1">{assignee.groupName}</span>
                            {assignee.startDate && <>
                                <span id={`start-date-${assignee.groupId}`}
                                    className="ms-auto me-2">🕑 {(typeof assignee.startDate === "number"
                                        ? new Date(assignee.startDate)
                                        : assignee.startDate).toDateString()}
                                </span>
                            </>}
                            <button className="close" aria-label="Unassign group"
                                onClick={() => confirmUnassignBoard(assignee.groupId, assignee.groupName)}>×
                            </button>
                        </li>
                    )}</ul>
                    : <p className="px-2">No groups.</p>}
            </div>
        </>,
        buttons: [<Button key={0} color="keyline" className="w-100" onClick={toggle}>Close</Button>]
    };
};

interface SetAssignmentsTableProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
    boardView: BoardViews;
    switchView: (e: React.ChangeEvent<HTMLInputElement>) => void;
    boardSubject: BoardSubjects;
    setBoardSubject: (boardSubject: BoardSubjects) => void;
    boardTitleFilter: string;
    setBoardTitleFilter: (title: string) => void;
    boardCreator: BoardCreators;
    setBoardCreator: (creator: BoardCreators) => void;
    boardOrder: AssignmentBoardOrder;
    setBoardOrder: (boardOrder: AssignmentBoardOrder) => void;
    groupsByGameboard: { [p: string]: BoardAssignee[] };
    openAssignModal: (board: GameboardDTO) => void;
}

const PhyTable = (props: SetAssignmentsTableProps) => {
    const {
        user,
        boards, boardSubject, setBoardSubject,
        boardView, boardTitleFilter, setBoardTitleFilter,
        boardCreator, setBoardCreator,
        boardOrder, setBoardOrder,
        groupsByGameboard, openAssignModal
    } = props;

    const filteredBoards = useMemo(() => {
        return boards?.boards
            .filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter))
            .filter(board => formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
            .filter(board => boardSubject == "All" || (determineGameboardSubjects(board).includes(boardSubject.toLowerCase())));
    }, [boards, boardTitleFilter, boardCreator, boardSubject, user]);

    const tableHeader = <tr className="my-gameboard-table-header">
        <th className="text-center align-middle"><span className="ps-2 pe-2">Groups</span></th>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.title}
            reverseOrder={AssignmentBoardOrder["-title"]} currentOrder={boardOrder}
            setOrder={setBoardOrder} alignment="start">
            Board name
        </SortItemHeader>
        <th colSpan={2} className="text-center align-middle">
            <div className="d-flex align-items-center">
                Stages and Difficulties
                <i id="difficulties-help" className="icon icon-info icon-color-grey ms-2"/>
            </div>
            <UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                Practice: {difficultiesOrdered.slice(0, 2).map(d => difficultyShortLabelMap[d]).join(", ")}<br/>
                Challenge: {difficultiesOrdered.slice(2).map(d => difficultyShortLabelMap[d]).join(", ")}
            </UncontrolledTooltip>
        </th>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.visited}
            reverseOrder={AssignmentBoardOrder["-visited"]} currentOrder={boardOrder}
            setOrder={setBoardOrder}>
            Last viewed
        </SortItemHeader>
        <th className="text-center align-middle">Manage</th>
    </tr>;

    return <Card className="mt-2 mb-7">
        <CardBody id="boards-table">
            <Row>
                <Col lg={4}>
                    <Label className="w-100">
                        Filter boards <Input type="text"
                            onChange={(e) => setBoardTitleFilter(e.target.value)}
                            placeholder="Filter boards by name"/>
                    </Label>
                </Col>
                <Col sm={6} lg={2}>
                    <Label className="w-100">
                        Subject <Input type="select" value={boardSubject}
                            onChange={e => setBoardSubject(e.target.value as BoardSubjects)}>
                            {Object.values(BoardSubjects).map(subject => <option key={subject}
                                value={subject}>{subject}</option>)}
                        </Input>
                    </Label>
                </Col>
                <Col lg={2}>
                    <Label className="w-100">
                        Creator <Input type="select" value={boardCreator}
                            onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                            {Object.values(BoardCreators).map(creator => <option key={creator}
                                value={creator}>{creator}</option>)}
                        </Input>
                    </Label>
                </Col>
            </Row>

            <HorizontalScroller enabled={filteredBoards ? filteredBoards.length > 6 : false} className="mt-3">
                <Table className="mb-0">
                    <thead>
                        {tableHeader}
                    </thead>
                    <tbody>
                        {filteredBoards?.map(board =>
                            <BoardCard
                                key={board.id}
                                user={user}
                                board={board}
                                boardView={boardView}
                                assignees={(isDefined(board?.id) && groupsByGameboard[board.id]) || []}
                                toggleAssignModal={() => openAssignModal(board)}
                            />)
                        }
                    </tbody>
                </Table>
            </HorizontalScroller>
        </CardBody>
    </Card>;
};
const CSTable = (props: SetAssignmentsTableProps) => {
    const {
        user,
        boards, boardView, switchView,
        boardTitleFilter, setBoardTitleFilter,
        boardCreator, setBoardCreator,
        boardOrder, setBoardOrder,
        groupsByGameboard, openAssignModal
    } = props;

    const tableHeader = <tr className="my-gameboard-table-header">
        <th>Groups</th>
        <SortItemHeader<AssignmentBoardOrder> colSpan={2} defaultOrder={AssignmentBoardOrder.title}
            reverseOrder={AssignmentBoardOrder["-title"]} currentOrder={boardOrder}
            setOrder={setBoardOrder}>
            Quiz name
        </SortItemHeader>
        <th colSpan={2} className="long-titled-col">
            Stages and Difficulties <span id={`difficulties-help`} className="icon-help mx-1"/>
            <UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                Practice: {difficultiesOrdered.slice(0, 2).map(d => difficultyShortLabelMap[d]).join(", ")}<br/>
                Challenge: {difficultiesOrdered.slice(2).map(d => difficultyShortLabelMap[d]).join(", ")}
            </UncontrolledTooltip>
        </th>
        <th>Creator</th>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.visited}
            reverseOrder={AssignmentBoardOrder["-visited"]} currentOrder={boardOrder}
            setOrder={setBoardOrder}>
            Last viewed
        </SortItemHeader>
        <th>Manage</th>
        <th>Share</th>
        <th>Delete</th>
    </tr>;

    return <div className={"mb-7 mt-4"}>
        <Row>
            <Col xs={6} md={4} lg={3} xl={3}>
                <Label className="w-100">
                    Display in <Input type="select" value={boardView} onChange={switchView}>
                        {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                    </Input>
                </Label>
            </Col>
            <Col xs={{size: 12, order: 3}} md={{size: 4, offset: 1, order: 1}} lg={{size: 4, offset: 3}}
                xl={{size: 4, offset: 3}}>
                <Label className="w-100">
                    <span
                        className={"text-nowrap"}>Filter {siteSpecific("question decks", "quizzes")} by name</span><Input
                        type="text" onChange={(e) => setBoardTitleFilter(e.target.value)}/>
                </Label>
            </Col>
            <Col xs={6} md={{size: 3, order: 2}} lg={2} xl={2}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by Creator</span><Input type="select" value={boardCreator}
                        onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                        {Object.values(BoardCreators).map(creator => <option key={creator}
                            value={creator}>{creator}</option>)}
                    </Input>
                </Label>
            </Col>
        </Row>
        <HorizontalScroller enabled={boards ? boards.boards.length > 6 : false}>
            <Table className="mt-3 my-gameboard-table">
                <thead>
                    {tableHeader}
                </thead>
                <tbody>
                    {boards?.boards
                        .filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter)
                        && (formatBoardOwner(user, board) == boardCreator || boardCreator == "All"))
                        .map(board =>
                            <BoardCard
                                key={board.id}
                                user={user}
                                board={board}
                                boardView={boardView}
                                assignees={(isDefined(board?.id) && groupsByGameboard[board.id]) || []}
                                toggleAssignModal={() => openAssignModal(board)}
                            />)
                    }
                </tbody>
            </Table>
        </HorizontalScroller>
    </div>;
};
const SetAssignmentsTable = siteSpecific(PhyTable, CSTable);

export const PhyAddGameboardButtons = ({className, redirectBackTo}: { className: string, redirectBackTo: string }) => {
    const dispatch = useAppDispatch();
    return <>
        <h4 className="mt-4 mb-3">
            Add a {siteSpecific("question deck", "quiz")} from ...
        </h4>
        <Row className={className}>
            <Col md={6} lg={4} className="pt-1">
                <Button role={"link"} onClick={() => {
                    setAssignBoardPath(redirectBackTo);
                    dispatch(openIsaacBooksModal());
                }} color="secondary" block className="px-3">
                    our books
                </Button>
            </Col>
            <Col md={6} lg={4} className="pt-1">
                <Button tag={Link} to={"/physics/a_level/question_decks"}
                    onClick={() => setAssignBoardPath(redirectBackTo)} color="secondary" block>
                    our topic question decks
                </Button>
            </Col>
            <Col md={12} lg={4} className="pt-1">
                <Button tag={Link} to={PATHS.GAMEBOARD_BUILDER} onClick={() => setAssignBoardPath(redirectBackTo)}
                    color="secondary" block>
                    create a question deck
                </Button>
            </Col>
        </Row>
    </>;
};

export const getAssigneesByBoard = (assignmentsSetByMe: AssignmentDTO[] | undefined): Record<string, BoardAssignee[]> => {
    return assignmentsSetByMe?.reduce((acc, assignment) => {
        if (!isDefined(assignment?.gameboardId) || !isDefined(assignment?.groupId)) return acc;
        const newAssignee = {
            groupId: assignment.groupId,
            groupName: assignment.groupName,
            startDate: assignment.scheduledStartDate
        };
        if (!(assignment.gameboardId in acc)) {
            return {...acc, [assignment.gameboardId]: [newAssignee]};
        }
        return {...acc, [assignment.gameboardId]: [...acc[assignment.gameboardId], newAssignee]};
    }, {} as { [gameboardId: string]: BoardAssignee[] }) ?? {};
};

export const SetAssignments = () => {
    // We know the user is logged in and is at least a teacher in order to visit this page
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const {data: groups} = useGetGroupsQuery(false);
    const {data: assignmentsSetByMe} = useGetMySetAssignmentsQuery(undefined);
    const groupsByGameboard = useMemo(() => getAssigneesByBoard(assignmentsSetByMe), [assignmentsSetByMe]);

    const [boardCreator, setBoardCreator] = useState<BoardCreators>(BoardCreators.all);
    const [boardSubject, setBoardSubject] = useState<BoardSubjects>(BoardSubjects.all);

    const deviceSize = useDeviceSize();
    const {
        boards, loading, viewMore,
        boardOrder, setBoardOrder,
        boardView, setBoardView,
        boardLimit, setBoardLimit,
        boardTitleFilter, setBoardTitleFilter
    } = useGameboards(isAda && above["lg"](deviceSize) ? BoardViews.table : BoardViews.card, BoardLimit.six);

    const isGroupsEmptyState = !(groups && groups.length > 0);
    const isBoardsEmptyState = !(boards && boards.boards?.length > 0);
    const switchView = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setBoardView(e.target.value as BoardViews);
    }, [setBoardView]);

    // Logic for set assignments modal.
    // hashAnchor acts as a buffer for a modal that needs to be opened. If it is set, the next time we get boards from
    // the API, a modal will be open with the gameboard specified by hashAnchor, **and then hashAnchor will be cleared**.
    const {hash} = useLocation();
    const [hashAnchor, setHashAnchor] = useState<string | undefined>();
    useEffect(() => {
        setHashAnchor(hash.includes("#") ? hash.slice(1) : undefined);
    }, [hash]);

    useEffect(() => {
        if (boardLimit !== BoardLimit.All) {
            if (boardTitleFilter || boardCreator !== BoardCreators.all || boardSubject !== BoardSubjects.all) {
                setBoardLimit(BoardLimit.All);
            }
        }
    }, [boardTitleFilter, boardCreator, boardSubject, setBoardLimit, boardLimit]);

    const dispatch = useAppDispatch();
    const [unassignBoard] = useUnassignGameboardMutation();

    const openAssignModal = useCallback((board: GameboardDTO) => {
        dispatch(openActiveModal(SetAssignmentsModal({
            board,
            groups: groups ?? [],
            assignees: (isDefined(board) && isDefined(board?.id) && groupsByGameboard[board.id]) || [],
            toggle: () => dispatch(closeActiveModal()),
            unassignBoard
        })));
    }, [dispatch, groups, groupsByGameboard, unassignBoard]);

    useEffect(() => {
        if (boards && hashAnchor) {
            setHashAnchor(undefined);
            const board = boards.boards.find(b => b.id === hashAnchor);
            if (board) {
                openAssignModal(board);
            }
        }
    }, [boards, hashAnchor, openAssignModal]);

    // Page help
    const pageHelp = <span>
        Use this page to set {siteSpecific("assignments", "quizzes")} to your groups. You can {siteSpecific("assign", "set")} any {siteSpecific("question deck", "quiz")} you have saved to your account.
        <br/>
        Students in the group will be emailed when you set a new {siteSpecific("assignment", "quiz")}.
    </span>;

    const tableProps: SetAssignmentsTableProps = {
        user,
        boards, boardSubject, setBoardSubject,
        boardView, switchView, boardTitleFilter, setBoardTitleFilter,
        boardCreator, setBoardCreator, boardOrder, setBoardOrder,
        groupsByGameboard, openAssignModal
    };

    const filteredBoards = useMemo(() => 
        boards?.boards.filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter))
            .filter(board => formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
            .filter(board => boardSubject == "All" || (determineGameboardSubjects(board).includes(boardSubject.toLowerCase())))
            .map(board =>
                <Col key={board.id}>
                    <BoardCard
                        user={user}
                        board={board}
                        boardView={boardView}
                        assignees={(isDefined(board?.id) && groupsByGameboard[board.id]) || []}
                        toggleAssignModal={() => openAssignModal(board)}
                    />
                </Col>
            ), 
    [boards, user, boardTitleFilter, boardCreator, boardSubject, boardView, groupsByGameboard, openAssignModal]);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("Set assignments", "Manage assignments")}
            icon={{type: "hex", icon: "icon-question-deck"}} help={pageHelp}
            modalId="help_modal_set_assignments"
        />
        <SidebarLayout>
            <SetAssignmentsSidebar
                displayMode={boardView} setDisplayMode={setBoardView}
                displayLimit={boardLimit} setDisplayLimit={setBoardLimit}
                boardTitleFilter={boardTitleFilter} setBoardTitleFilter={setBoardTitleFilter}
                sortOrder={boardOrder} setSortOrder={setBoardOrder}
                boardSubject={boardSubject} setBoardSubject={setBoardSubject}
                boardCreator={boardCreator} setBoardCreator={setBoardCreator}
                sortDisabled={!!boards && boards.boards.length !== boards.totalResults}
                hideButton
            />
            <MainContent>
                <PageMetadata showSidebarButton sidebarInTitle />
                <PageFragment fragmentId={siteSpecific("help_toptext_set_gameboards", "set_quizzes_help")}
                    ifNotFound={RenderNothing}/>
                {isPhy &&
                    <>
                        <PhyAddGameboardButtons className={"mb-4"} redirectBackTo={PATHS.SET_ASSIGNMENTS}/>
                        {isGroupsEmptyState && <Alert color="warning">
                            You have not created any groups to assign work to.
                            Please <Link to="/groups">create a group here first.</Link>
                        </Alert>}
                        {isBoardsEmptyState ?
                            <Alert color="warning">
                                You have no {siteSpecific("question decks", "quizzes")} to assign. Use one of the
                                options above to find one.
                            </Alert>
                            :
                            <>
                                <h5>
                                Use the <Link to={"/assignment_schedule"}>assignment schedule</Link> page to view
                                assignments by start date and due date.
                                </h5>
                                <div className="section-divider my-4"/>
                            </>
                        }

                    </>
                }
                {isAda && <>
                    {isGroupsEmptyState &&
                        <PromptBanner
                            card={{
                                title: "You need a student group before you can assign a quiz to students.",
                                icon: {src: "/assets/cs/icons/group.svg"},
                                bodyText: "",
                                color: "yellow",
                                buttons: {
                                    primary: {
                                        text: "Create a group",
                                        clickUrl: "/groups",
                                        style: "outline"
                                    }
                                }
                            }}
                        />
                    }
                    <h3>Your quizzes</h3>
                    <div
                        className={classNames("mb-4", "d-flex", "flex-column", "flex-lg-row", "align-items-center", {"justify-content-start": isBoardsEmptyState}, {"justify-content-between": !isBoardsEmptyState})}>
                        {!(boards && boards.totalResults === 0) &&
                            <div>
                                <p className={"d-none d-lg-block my-auto"}>{`You have ${boards?.boards.length} created quiz${boards && boards.boards?.length > 1 ? "zes" : ""}.`}</p>
                            </div>
                        }
                        <div className={"w-100 w-lg-auto"}>
                            <Button className={"w-100 w-lg-auto"} tag={Link} to={PATHS.GAMEBOARD_BUILDER}
                                onClick={() => setAssignBoardPath(PATHS.SET_ASSIGNMENTS)} color="solid">
                                Create a quiz
                            </Button>
                            <Button className={"w-100 w-lg-auto mt-2 mt-lg-auto mx-auto mx-lg-2"} tag={Link}
                                to={"/pages/revision_quizzes"} color={"secondary"} outline>
                                View pre-made quizzes
                            </Button>
                        </div>
                    </div>
                </>}
                {!isBoardsEmptyState && <>
                    {isAda && <>
                        <Row>
                            {boardView === BoardViews.card && <Col sm={6} lg={3}>
                                <Label className="w-100">
                                Display in <Input type="select" value={boardView} onChange={switchView}>
                                        {Object.values(BoardViews).map(view => <option key={view}
                                            value={view}>{view}</option>)}
                                    </Input>
                                </Label>
                            </Col>}
                            {boardView === BoardViews.card && <>
                                <Col xs={6} lg={{size: 2, offset: 3}}>
                                    <Label className="w-100">
                                    Show <Input type="select" value={boardLimit}
                                            onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                                            {Object.values(BoardLimit).map(limit => <option key={limit}
                                                value={limit}>{limit}</option>)}
                                        </Input>
                                    </Label>
                                </Col>
                                <Col xs={6} lg={4}>
                                    <Label className="w-100">
                                    Sort by <Input type="select" value={boardOrder}
                                            onChange={e => setBoardOrder(e.target.value as AssignmentBoardOrder)}>
                                            {Object.values(AssignmentBoardOrder).map(order => <option key={order}
                                                value={order}>{BOARD_ORDER_NAMES[order]}</option>)}
                                        </Input>
                                    </Label>
                                </Col>
                            </>}
                        </Row>
                    </>}
                    <ShowLoading until={boards}>
                        {boards && boards.boards && <div>
                            {boardView == BoardViews.card ?
                                // Card view
                                <>
                                    <Row
                                        className={siteSpecific("row-cols-1", "row-cols-lg-3 row-cols-md-2 row-cols-1")}>
                                        {filteredBoards}
                                    </Row>
                                    <div className="text-center mt-3 mb-4" style={{clear: "both"}}>
                                        <p>Showing <strong>{filteredBoards?.length}</strong> of <strong>{boards.totalResults}</strong>
                                        </p>
                                        {boards.boards.length < boards.totalResults &&
                                            <Button onClick={viewMore} disabled={loading}>{loading ?
                                                <Spinner/> : "View more"}</Button>}
                                    </div>
                                </>
                                :
                                // Table view
                                <SetAssignmentsTable {...tableProps}/>}
                        </div>}
                    </ShowLoading>
                </>
                }
            </MainContent>
        </SidebarLayout>
    </Container>;
};
