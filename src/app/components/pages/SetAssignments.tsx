import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import * as RS from "reactstrap";
import {
    Alert,
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner,
    Table,
    UncontrolledTooltip
} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {
    assignGameboard,
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
    isStaff,
    Item,
    itemise,
    nthHourOf,
    PATHS,
    selectOnChange,
    siteSpecific,
    sortIcon,
    useDeviceSize,
    useGameboards
} from "../../services";
import {IsaacSpinner, Loading} from "../handlers/IsaacSpinner";
import {GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import {BoardAssignee, BoardOrder, Boards} from "../../../IsaacAppTypes";
import {BoardCard} from "../elements/cards/BoardCard";
import classNames from "classnames";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";

interface AssignGroupProps {
    groups: UserGroupDTO[];
    allowScheduling: boolean;
    board: GameboardDTO | undefined;
}
const AssignGroup = ({groups, board, allowScheduling}: AssignGroupProps) => {
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date>();
    const [scheduledStartDate, setScheduledStartDate] = useState<Date>();
    const [assignmentNotes, setAssignmentNotes] = useState<string>();
    const user = useAppSelector(selectors.user.orNull);
    const dispatch = useAppDispatch();

    if (!board) return <Loading/>;

    function assign() {
        dispatch(assignGameboard({boardId: board?.id as string, groups: selectedGroups, dueDate, scheduledStartDate, notes: assignmentNotes})).then(success => {
            if (success) {
                setSelectedGroups([]);
                setDueDate(undefined);
                setScheduledStartDate(undefined);
                setAssignmentNotes('');
            }
        });
    }

    const yearRange = range(currentYear, currentYear + 5);
    const dueDateInvalid = dueDate && scheduledStartDate ? nthHourOf(0, scheduledStartDate).valueOf() > dueDate.valueOf() : false;

    function setScheduledStartDateAtSevenAM(e: ChangeEvent<HTMLInputElement>) {
        const utcDate = e.target.valueAsDate;
        if (utcDate) {
            const scheduledDate = new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate(), 7);
            // Sets the scheduled date to 7AM in the timezone of the browser.
            setScheduledStartDate(scheduledDate);
        } else {
            setScheduledStartDate(null as unknown as Date); {/* DANGER here with force-casting Date|null to Date */}
        }
    }

    return <Container className="py-2">
        <Label className="w-100 pb-2">Group{isStaff(user) ? "(s)" : ""}:
            <StyledSelect inputId="groups-to-assign" isMulti={isStaff(user)} isClearable placeholder="None"
                    value={selectedGroups}
                    closeMenuOnSelect={!isStaff(user)}
                    onChange={selectOnChange(setSelectedGroups, false)}
                    options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
            />
        </Label>
        {allowScheduling && <Label className="w-100 pb-2">Schedule an assignment start date <span className="text-muted"> (optional)</span>
            <DateInput value={scheduledStartDate} placeholder="Select your scheduled start date..." yearRange={yearRange}
                       onChange={setScheduledStartDateAtSevenAM} />
        </Label>}
        <Label className="w-100 pb-2">Due date reminder <span className="text-muted"> (optional)</span>
            <DateInput value={dueDate} placeholder="Select your due date..." yearRange={yearRange}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.valueAsDate as Date)} /> {/* DANGER here with force-casting Date|null to Date */}
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
            role={"button"}
            disabled={selectedGroups.length === 0 || (isDefined(assignmentNotes) && assignmentNotes.length > 500)}
        >Assign to group{selectedGroups.length > 1 ? "s" : ""}</Button>
    </Container>;
};

type SetAssignmentsModalProps = {
    user: RegisteredUserDTO;
    isOpen: boolean;
    toggle: () => void;
    allowScheduling: boolean;
    groups: UserGroupDTO[];
    board: GameboardDTO | undefined;
    assignees: BoardAssignee[];
    boards?: Boards;
};
const SetAssignmentsModal = (props: SetAssignmentsModalProps) => {
    const {isOpen, toggle, allowScheduling, board, assignees} = props;

    const [ unassignBoard ] = useUnassignGameboardMutation();

    const hasStarted = (a : {startDate?: Date | number}) => !a.startDate || (Date.now() > a.startDate.valueOf());

    const startedAssignees = useMemo(() => allowScheduling ? assignees.filter(hasStarted) : assignees, [assignees]);
    const scheduledAssignees = useMemo(() => assignees.filter(a => !hasStarted(a)), [assignees]);

    function confirmUnassignBoard(groupId: number, groupName?: string) {
        if (board?.id && confirm(`Are you sure you want to unassign this ${siteSpecific("gameboard", "quiz")} from ${groupName ? `group ${groupName}` : "this group"}?`)) {
            unassignBoard({boardId: board?.id, groupId});
        }
    }

    const description = siteSpecific(
        "Manage assignment of groups to the selected gameboard",
        "Select a group to which to assign the quiz"
    );

    return <Modal isOpen={isOpen} data-testid={"set-assignment-modal"} toggle={toggle}>
        <ModalHeader data-testid={"modal-header"} role={"heading"} className={"text-break"} close={
            <button role={"button"} className={classNames("text-nowrap", {"btn-link bg-transparent": isAda, "close": isPhy})} onClick={toggle}>
                Close
            </button>
        }>
            {board?.title}
        </ModalHeader>
        <ModalBody>
            <p className="px-1">{description}</p>
            <hr className="text-center" />
            <AssignGroup {...props} />
            <hr className="text-center" />
            <div className={classNames("py-2", {"border-bottom": allowScheduling})}>
                <Label>{siteSpecific("Board", "Quiz")} currently assigned to:</Label>
                {startedAssignees.length > 0
                    ? <Container className="mb-4">{startedAssignees.map(assignee =>
                        <Row data-testid={"current-assignment"} key={assignee.groupId} className="px-1">
                            <span className="flex-grow-1">{assignee.groupName}</span>
                            <button className="close" aria-label="Unassign group" onClick={() => confirmUnassignBoard(assignee.groupId, assignee.groupName)}>×</button>
                        </Row>
                    )}</Container>
                    : <p>No groups.</p>}
            </div>
            {allowScheduling && <div className="py-2">
                <Label>Pending {siteSpecific("assignments", "quiz assignments")}: <span className="icon-help mx-1" id={`pending-assignments-help-${board?.id}`}/></Label>
                <UncontrolledTooltip placement="left" autohide={false} target={`pending-assignments-help-${board?.id}`}>
                    {siteSpecific("Assignments", "Quizzes")} that are scheduled to begin at a future date. Once the start date passes, students
                    will be able to see the {siteSpecific("assignment", "quiz")}, and will receive a notification email.
                </UncontrolledTooltip>
                {scheduledAssignees.length > 0
                    ? <Container className="mb-4">{scheduledAssignees.map(assignee =>
                        <Row data-testid={"pending-assignment"} key={assignee.groupId} className="px-1">
                            <span className="flex-grow-1">{assignee.groupName}</span>
                            {assignee.startDate && <>
                                    <span id={`start-date-${assignee.groupId}`} className="ml-auto mr-2">🕑 {(typeof assignee.startDate === "number"
                                        ? new Date(assignee.startDate)
                                        : assignee.startDate).toDateString()}
                                    </span>
                            </>}
                            <button className="close" aria-label="Unassign group" onClick={() => confirmUnassignBoard(assignee.groupId, assignee.groupName)}>×</button>
                        </Row>
                    )}</Container>
                    : <p>No groups.</p>}
            </div>}
        </ModalBody>
        {isPhy && <ModalFooter>
            <Button block color="tertiary" onClick={toggle}>Close</Button>
        </ModalFooter>}
    </Modal>;
}

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
    boardOrder: BoardOrder;
    setBoardOrder: (boardOrder: BoardOrder) => void;
    groupsByGameboard: {[p: string]: BoardAssignee[]};
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
    return <Card className="mt-2 mb-5">
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

            <div className="overflow-auto mt-3">
                <Table className="mb-0">
                    <thead>
                    <tr>
                        <th className="text-center align-middle"><span
                            className="pl-2 pr-2">Groups</span></th>
                        <th className="align-middle pointer-cursor">
                            <button className="table-button"
                                    onClick={() => boardOrder == BoardOrder.title ? setBoardOrder(BoardOrder["-title"]) : setBoardOrder(BoardOrder.title)}>
                                Board
                                name {boardOrder == BoardOrder.title ? sortIcon.ascending : boardOrder == BoardOrder["-title"] ? sortIcon.descending : sortIcon.sortable}
                            </button>
                        </th>
                        <th className="text-center align-middle">Stages</th>
                        <th className="text-center align-middle">Difficulties</th>
                        <th className="text-center align-middle">Creator</th>
                        <th className="text-center align-middle pointer-cursor">
                            <button className="table-button"
                                    onClick={() => boardOrder == BoardOrder.created ? setBoardOrder(BoardOrder["-created"]) : setBoardOrder(BoardOrder.created)}>
                                Created {boardOrder == BoardOrder.created ? sortIcon.ascending : boardOrder == BoardOrder["-created"] ? sortIcon.descending : sortIcon.sortable}
                            </button>
                        </th>
                        <th className="text-center align-middle pointer-cursor">
                            <button className="table-button"
                                    onClick={() => boardOrder == BoardOrder.visited ? setBoardOrder(BoardOrder["-visited"]) : setBoardOrder(BoardOrder.visited)}>
                                Last
                                viewed {boardOrder == BoardOrder.visited ? sortIcon.ascending : boardOrder == BoardOrder["-visited"] ? sortIcon.descending : sortIcon.sortable}
                            </button>
                        </th>
                        <th className="text-center align-middle">Assignments</th>
                        <th className="text-center align-middle">Share</th>
                    </tr>
                    </thead>
                    <tbody>
                    {boards?.boards
                        .filter(board => board.title && board.title.toLowerCase().includes(boardTitleFilter.toLowerCase())
                            && (formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
                            && (boardSubject == "All" || (determineGameboardSubjects(board).includes(boardSubject.toLowerCase()))))
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
            </div>
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
    return <div className={"mb-5 mb-md-6 mt-4"}>
        <Row>
            <Col xs={6} md={4} lg={3} xl={3}>
                <Label className="w-100">
                    Display in <Input type="select" value={boardView} onChange={switchView}>
                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                </Input>
                </Label>
            </Col>
            <Col xs={{size: 12, order: 3}} md={{size: 4, offset: 1, order: 1}} lg={{size: 4, offset: 3}} xl={{size: 4, offset: 3}}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter {siteSpecific("boards", "quizzes")} by name</span><Input type="text" onChange={(e) => setBoardTitleFilter(e.target.value)} />
                </Label>
            </Col>
            <Col xs={6} md={{size: 3, order: 2}} lg={2} xl={2}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by Creator</span><Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                    {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
                </Input>
                </Label>
            </Col>
        </Row>
        <Table className="mt-3 my-gameboard-table" responsive>
            <thead>
            <tr>
                <th>Groups</th>
                <th colSpan={4} className="w-100">
                    <button className="table-button" onClick={() => boardOrder == BoardOrder.title ? setBoardOrder(BoardOrder["-title"]) : setBoardOrder(BoardOrder.title)}>
                        Quiz name {boardOrder == BoardOrder.title ? sortIcon.ascending : boardOrder == BoardOrder["-title"] ? sortIcon.descending : sortIcon.sortable}
                    </button>
                </th>
                <th colSpan={2} className="long-titled-col">
                    Stages and Difficulties <span id={`difficulties-help`} className="icon-help mx-1" />
                    <RS.UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                        Practice: {difficultiesOrdered.slice(0, 2).map(d => difficultyShortLabelMap[d]).join(", ")}<br />
                        Challenge: {difficultiesOrdered.slice(2).map(d => difficultyShortLabelMap[d]).join(", ")}
                    </RS.UncontrolledTooltip>
                </th>
                <th>Creator</th>
                <th>
                    <button className="table-button" onClick={() => boardOrder == BoardOrder.created ? setBoardOrder(BoardOrder["-created"]) : setBoardOrder(BoardOrder.created)}>
                        Created {boardOrder == BoardOrder.created ? sortIcon.ascending : boardOrder == BoardOrder["-created"] ? sortIcon.descending : sortIcon.sortable}
                    </button>
                </th>
                <th>
                    <button className="table-button" onClick={() => boardOrder == BoardOrder.visited ? setBoardOrder(BoardOrder["-visited"]) : setBoardOrder(BoardOrder.visited)}>
                        Last viewed {boardOrder == BoardOrder.visited ? sortIcon.ascending : boardOrder == BoardOrder["-visited"] ? sortIcon.descending : sortIcon.sortable}
                    </button>
                </th>
                <th>{siteSpecific("Assign", "Manage")}</th>
                <th>Share</th>
            </tr>
            </thead>
            <tbody>
            {boards?.boards
                .filter(board => board.title && board.title.toLowerCase().includes(boardTitleFilter.toLowerCase())
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
    </div>;
}
const SetAssignmentsTable = siteSpecific(PhyTable, CSTable);

export const PhyAddGameboardButtons = ({className, redirectBackTo}: {className: string, redirectBackTo: string}) => {
    const dispatch = useAppDispatch();
    return <>
        <h4 className="mt-4 mb-3">
            Add a {siteSpecific("gameboard", "quiz")} from ...
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
                <Button tag={Link} to={"/pages/pre_made_gameboards"} onClick={() => setAssignBoardPath(redirectBackTo)} color="secondary" block>
                    our Boards for Lessons
                </Button>
            </Col>
            <Col md={12} lg={4} className="pt-1">
                <Button tag={Link} to={PATHS.GAMEBOARD_BUILDER} onClick={() => setAssignBoardPath(redirectBackTo)} color="secondary" block>
                    create a gameboard
                </Button>
            </Col>
        </Row>
    </>;
};

export const SetAssignments = () => {
    // We know the user is logged in and is at least a teacher in order to visit this page
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const userPreferences = useAppSelector(selectors.user.preferences);
    const { data: groups } = useGetGroupsQuery(false);
    const { data: assignmentsSetByMe } = useGetMySetAssignmentsQuery(undefined);
    const groupsByGameboard = useMemo<{[gameboardId: string]: BoardAssignee[]}>(() =>
        assignmentsSetByMe?.reduce((acc, assignment) => {
            if (!isDefined(assignment?.gameboardId) || !isDefined(assignment?.groupId)) return acc;
            const newAssignee = {groupId: assignment.groupId, groupName: assignment.groupName, startDate: assignment.scheduledStartDate};
            if (!(assignment.gameboardId in acc)) {
                return {...acc, [assignment.gameboardId]: [newAssignee]};
            }
            return {...acc, [assignment.gameboardId]: [...acc[assignment.gameboardId], newAssignee]};
        }, {} as {[gameboardId: string]: BoardAssignee[]}) ?? {}
    , [assignmentsSetByMe]);

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

    const switchView = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setBoardView(e.target.value as BoardViews);
    }, [setBoardView]);

    // Whether to let the user schedule assignments for the future
    const allowScheduling = siteSpecific(isStaff(user) || (userPreferences?.BETA_FEATURE?.SCHEDULE_ASSIGNMENTS ?? false), true);

    // Logic for set assignments modal.
    // hashAnchor acts as a buffer for a modal that needs to be opened. If it is set, the next time we get boards from
    // the API, a modal will be open with the gameboard specified by hashAnchor, **and then hashAnchor will be cleared**.
    const {hash} = useLocation();
    const [hashAnchor, setHashAnchor] = useState<string | undefined>();
    useEffect(() => {
        setHashAnchor(hash.includes("#") ? hash.slice(1) : undefined);
    }, [hash]);

    const [modalBoard, setModalBoard] = useState<GameboardDTO>();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const openAssignModal = (board: GameboardDTO) => {
        setModalBoard(board);
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (boards && hashAnchor) {
            setHashAnchor(undefined);
            const board = boards.boards.find(b => b.id === hashAnchor);
            if (board) {
                openAssignModal(board);
            }
        }
    }, [boards, hashAnchor]);

    // Page help
    const pageHelp = <span>
        Use this page to set {siteSpecific("assignments", "quizzes")} to your groups. You can {siteSpecific("assign", "set")} any {siteSpecific("gameboard", "quiz")} you have saved to your account.
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

    return <Container> {/* fluid={siteSpecific(false, true)} className={classNames({"px-lg-5 px-xl-6": isAda})} */}
        <SetAssignmentsModal
            isOpen={isModalOpen}
            toggle={() => setIsModalOpen(false)}
            allowScheduling={allowScheduling} user={user}
            groups={groups ?? []}
            board={modalBoard}
            assignees={(isDefined(modalBoard) && isDefined(modalBoard?.id) && groupsByGameboard[modalBoard.id]) || []}
        />

        <TitleAndBreadcrumb currentPageTitle={siteSpecific("Set assignments", "Set quizzes")} help={pageHelp} modalId="set_assignments_help"/>
        {isAda && <PageFragment fragmentId={"set_quizzes_help"} ifNotFound={RenderNothing} />}
        {isPhy && <PhyAddGameboardButtons className={"mb-4"} redirectBackTo={PATHS.SET_ASSIGNMENTS}/>}
        {groups && groups.length === 0 && <Alert color="warning">
            You have not created any groups to assign work to.
            Please <Link to="/groups">create a group here first.</Link>
        </Alert>}
        {boards && boards.totalResults === 0
            ? <h3 className="text-center mt-4 mb-5">
                You have no {siteSpecific("gameboards", "quizzes")} to assign
                {siteSpecific(
                    "; use one of the options above to find one.",
                    <Button className={"ml-3"} tag={Link} to={PATHS.GAMEBOARD_BUILDER} onClick={() => setAssignBoardPath(PATHS.SET_ASSIGNMENTS)} size="sm" color="secondary">
                        Create a quiz
                    </Button>
                )}
            </h3>
            : <>
                {boards && boards.totalResults > 0 && <h4>
                    You have <strong>{boards.totalResults}</strong> {siteSpecific("gameboard", "quiz")}{boards.totalResults > 1 && siteSpecific("s", "zes")} ready to assign...{" "}
                    {isAda && <Button className={"font-size-1-25"} tag={Link} to={PATHS.GAMEBOARD_BUILDER} onClick={() => setAssignBoardPath(PATHS.SET_ASSIGNMENTS)} color="link">
                        create another quiz?
                    </Button>}
                </h4>}
                {!boards && <h4>
                    You have <IsaacSpinner size="sm" inline/> {siteSpecific("gameboards", "quizzes")} ready to assign...
                </h4>}
                <Row>
                    {(isPhy || boardView === BoardViews.card) && <Col sm={6} lg={3} xl={2}>
                        <Label className="w-100">
                            Display in <Input type="select" value={boardView} onChange={switchView}>
                                {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                            </Input>
                        </Label>
                    </Col>}
                    <div className="d-lg-none w-100"/>
                    {boardView === BoardViews.card &&
                    <>
                        <Col xs={6} lg={{size: 2, offset: 3}} xl={{size: 2, offset: 4}}>
                            <Label className="w-100">
                                Show <Input type="select" value={boardLimit} onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                                    {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                                </Input>
                            </Label>
                        </Col>
                        <Col xs={6} lg={4}>
                            <Label className="w-100">
                                Sort by <Input type="select" value={boardOrder} onChange={e => setBoardOrder(e.target.value as BoardOrder)}>
                                    {Object.values(BoardOrder).map(order => <option key={order} value={order}>{BOARD_ORDER_NAMES[order]}</option>)}
                                </Input>
                            </Label>
                        </Col>
                    </>}
                </Row>
                <ShowLoading until={boards}>
                    {boards && boards.boards && <div>
                        {boardView == BoardViews.card ?
                            // Card view
                            <>
                                <Row className={"row-cols-lg-3 row-cols-md-2 row-cols-1"}>
                                    {boards.boards && boards.boards.map(board =>
                                        <Col key={board.id}>
                                            <BoardCard
                                                user={user}
                                                board={board}
                                                boardView={boardView}
                                                assignees={(isDefined(board?.id) && groupsByGameboard[board.id]) || []}
                                                toggleAssignModal={() => openAssignModal(board)}
                                            />
                                        </Col>)}
                                </Row>
                                <div className="text-center mt-3 mb-4" style={{clear: "both"}}>
                                    <p>Showing <strong>{boards.boards.length}</strong> of <strong>{boards.totalResults}</strong>
                                    </p>
                                    {boards.boards.length < boards.totalResults &&
                                    <Button onClick={viewMore} disabled={loading}>{loading ? <Spinner/> : "View more"}</Button>}
                                </div>
                            </>
                            :
                            // Table view
                            <SetAssignmentsTable {...tableProps}/>}
                    </div>}
                </ShowLoading>
            </>}
    </Container>;
};
