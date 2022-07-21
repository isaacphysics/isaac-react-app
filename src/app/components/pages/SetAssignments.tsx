import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardSubtitle,
    CardTitle,
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
import {Link, withRouter} from "react-router-dom";
import {
    assignBoard,
    deleteBoard,
    loadAssignmentsOwnedByMe,
    loadGroups,
    openIsaacBooksModal,
    showToast,
    unassignBoard
} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {AppGameBoard, BoardAssignee, BoardOrder, Boards, Toast} from "../../../IsaacAppTypes";
import {GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import {selectors} from "../../state/selectors";
import {range, sortBy} from "lodash";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {currentYear, DateInput} from "../elements/inputs/DateInput";
import {
    allPropertiesFromAGameboard,
    BOARD_ORDER_NAMES,
    BoardCreators,
    BoardLimit,
    BoardSubjects,
    BoardViews,
    determineGameboardSubjects,
    formatBoardOwner,
    generateGameboardSubjectHexagons,
    useGameboards
} from "../../services/gameboards";
import {connect, useSelector} from "react-redux";
import {formatDate} from "../elements/DateString";
import {ShareLink} from "../elements/ShareLink";
import {isPhy, siteSpecific} from "../../services/siteConstants";
import {isAdminOrEventManager, isStaff} from "../../services/user";
import {isDefined} from "../../services/miscUtils";
import {difficultiesOrdered, sortIcon, stageLabelMap, stagesOrdered} from "../../services/constants";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {AggregateDifficultyIcons} from "../elements/svg/DifficultyIcons";
import {above, below, useDeviceSize} from "../../services/device";
import Select from "react-select";
import {Item, itemise, selectOnChange} from "../../services/select";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) as RegisteredUserDTO,
    groups: selectors.groups.active(state)
});

const dispatchToProps = {loadGroups, loadAssignmentsOwnedByMe, deleteBoard, assignBoard, unassignBoard, showToast, openIsaacBooksModal};

interface SetAssignmentsPageProps {
    user: RegisteredUserDTO;
    groups: UserGroupDTO[] | null;
    loadGroups: (getArchived: boolean) => void;
    loadAssignmentsOwnedByMe: () => void;
    deleteBoard: (boardId?: string, boardTitle?: string) => void;
    assignBoard: (board: GameboardDTO, groups: Item<number>[], dueDate?: Date, assignmentNotes?: string, ownerUserId?: number) => Promise<boolean>;
    unassignBoard: (boardId?: string, groupId?: number) => void;
    showToast: (toast: Toast) => void;
    location: {hash: string};
    openIsaacBooksModal: () => void;
}

type BoardProps = SetAssignmentsPageProps & {
    board: AppGameBoard;
    assignees: BoardAssignee[];
    boardView: BoardViews;
    boards?: Boards;
}

const AssignGroup = ({groups, board, assignBoard}: BoardProps) => {
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date>();
    const [assignmentNotes, setAssignmentNotes] = useState<string>();
    const user = useSelector(selectors.user.orNull);

    function assign() {
        if (!user || !user.loggedIn) return;
        assignBoard(board, selectedGroups, dueDate, assignmentNotes, user.id).then(success => {
            if (success) {
                setSelectedGroups([]);
                setDueDate(undefined);
                setAssignmentNotes('');
            }
        });
    }

    const yearRange = range(currentYear, currentYear + 5);
    const currentMonth = (new Date()).getMonth() + 1;

    return <Container className="py-2">
        <Label className="w-100 pb-2">Group{isStaff(user) ? "(s)" : ""}:
            <Select inputId="groups-to-assign" isMulti={isStaff(user)} isClearable placeholder="None"
                    closeMenuOnSelect={!isStaff(user)}
                    onChange={selectOnChange(setSelectedGroups, false)}
                    options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id, g.groupName))}
            />
        </Label>
        <Label className="w-100 pb-2">Due Date Reminder <span className="text-muted"> (optional)</span>
            <DateInput value={dueDate} placeholder="Select your due date..." yearRange={yearRange} defaultYear={currentYear} defaultMonth={currentMonth}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.valueAsDate as Date)} /> {/* DANGER here with force-casting Date|null to Date */}
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
            disabled={selectedGroups.length === 0 || (isDefined(assignmentNotes) && assignmentNotes.length > 500)}
        >Assign to group{selectedGroups.length > 1 ? "s" : ""}</Button>
    </Container>;
};

const Board = (props: BoardProps) => {
    const {user, board, assignees, boardView, deleteBoard, unassignBoard, showToast, location: {hash}} = props;
    const hashAnchor = hash.includes("#") ? hash.slice(1) : "";
    const deviceSize = useDeviceSize();

    const assignmentLink = `/assignment/${board.id}`;

    const hasAssignedGroups = assignees && assignees.length > 0;

    function confirmDeleteBoard() {
        if (hasAssignedGroups) {
            if (isAdminOrEventManager(user)) {
                alert("Warning: You currently have groups assigned to this gameboard. If you delete this your groups will still be assigned but you won't be able to unassign them or see the gameboard in your assigned gameboards or 'My gameboards' page.");
            } else {
                showToast({color: "failure", title: "Gameboard Deletion Not Allowed", body: "You have groups assigned to this gameboard. To delete this gameboard, you must unassign all groups.", timeout: 5000});
                return;
            }
        }

        if (confirm(`Are you sure you want to remove '${board.title}' from your account?`)) {
            deleteBoard(board.id, board.title);
        }
    }

    function confirmUnassignBoard(groupId: number) {
        if (confirm("Are you sure you want to unassign this gameboard from this group?")) {
            unassignBoard(board.id, groupId);
        }
    }

    const [modal, setModal] = useState(board.id === hashAnchor);
    const toggleAssignModal = () => setModal(s => !s);

    const hexagonId = `board-hex-${board.id}`;

    const boardSubjects = determineGameboardSubjects(board);
    const boardStages = allPropertiesFromAGameboard(board, "stage", stagesOrdered);
    const boardDifficulties = allPropertiesFromAGameboard(board, "difficulty", difficultiesOrdered);

    return <>
        <Modal isOpen={modal} toggle={toggleAssignModal}>
            <ModalHeader close={
                <button className="close" onClick={toggleAssignModal}>
                    {"Close"}
                </button>
            }>
                {board.title}
            </ModalHeader>
            <ModalBody>
                <p className="px-1">Manage assignment of groups to the selected gameboard</p>
                <hr className="text-center" />
                <AssignGroup {...props} />
                <hr className="text-center" />
                <div className="py-2">
                    <Label>Board currently assigned to:</Label>
                    {hasAssignedGroups && <Container className="mb-4">{assignees.map(assignee =>
                        <Row key={assignee.groupId} className="px-1">
                            <span className="flex-grow-1">{assignee.groupName}</span>
                            <button className="close" aria-label="Unassign group" onClick={() => confirmUnassignBoard(assignee.groupId)}>×</button>
                        </Row>
                    )}</Container>}
                    {!hasAssignedGroups && <p>No groups.</p>}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button block color="tertiary" onClick={toggleAssignModal}>Close</Button>
            </ModalFooter>
        </Modal>
        {boardView == BoardViews.table ?
            // Table view
            <tr key={board.id} className="board-card">
                <td>
                    <div className="board-subject-hexagon-container table-view">
                        <button onClick={toggleAssignModal} id={hexagonId} className="board-subject-hexagon-container">
                            {generateGameboardSubjectHexagons(boardSubjects)}
                            <span className="groups-assigned">
                                <strong>{isDefined(assignees) ? assignees.length : <Spinner size="sm" />}</strong>
                                group{(!assignees || assignees.length != 1) && "s"}
                                {isDefined(assignees) &&
                                <UncontrolledTooltip target={"#" + hexagonId}>{assignees.length === 0 ?
                                    "No groups have been assigned."
                                    : ("Gameboard assigned to: " + assignees.map(g => g.groupName).join(", "))}
                                </UncontrolledTooltip>
                                }
                            </span>
                        </button>
                    </div>
                </td>
                <td className="align-middle"><a href={assignmentLink}>{board.title}</a></td>
                <td className="text-center align-middle">
                    {boardDifficulties.length > 0 && <AggregateDifficultyIcons difficulties={boardDifficulties} stacked />}
                </td>
                <td className="text-center align-middle">{formatBoardOwner(user, board)}</td>
                <td className="text-center align-middle">{formatDate(board.creationDate)}</td>
                <td className="text-center align-middle">{formatDate(board.lastVisited)}</td>
                <td className="text-center align-middle">
                    <Button color="tertiary" size="sm" style={{fontSize: 15}} onClick={toggleAssignModal}>
                        Assign&nbsp;/ Unassign
                    </Button>
                </td>
                <td className="text-center align-middle">
                    <div className="table-share-link">
                        <ShareLink linkUrl={assignmentLink} gameboardId={board.id} />
                    </div>
                </td>
            </tr>
            :
            // Card view
            <Card key={board.id} className="board-card card-neat">
                <CardBody className="pb-4 pt-4">
                    <button className="close" onClick={confirmDeleteBoard} aria-label="Delete gameboard">×</button>
                    <button onClick={toggleAssignModal} id={hexagonId} className="board-subject-hexagon-container">
                        {generateGameboardSubjectHexagons(boardSubjects)}
                        <span className="groups-assigned">
                            <strong>{isDefined(assignees) ? assignees.length : <IsaacSpinner size="sm" />}</strong>
                            group{(!assignees || assignees.length != 1) && "s"}
                            {isDefined(assignees) &&
                            <UncontrolledTooltip target={"#" + hexagonId}>{assignees.length === 0 ?
                                "No groups have been assigned."
                                : ("Gameboard assigned to: " + assignees.map(g => g.groupName).join(", "))}
                            </UncontrolledTooltip>
                            }
                        </span>
                    </button>
                    <aside>
                        <CardSubtitle>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                        <CardSubtitle>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
                        <CardSubtitle>Stages: <strong className="d-inline-flex">{boardStages.length > 0 ? boardStages.map(s => stageLabelMap[s]).join(', ') : "N/A"}</strong></CardSubtitle>
                        <CardSubtitle>
                            {`Difficult${boardDifficulties.length !== 1 ? "ies" : "y"}: `}
                            <strong>
                                {boardDifficulties.length > 0 ?
                                    <AggregateDifficultyIcons stacked={above["lg"](deviceSize) || below["xs"](deviceSize)} difficulties={boardDifficulties} />
                                    : "N/A"
                                }
                            </strong>
                        </CardSubtitle>
                    </aside>
                    <Row className="mt-1">
                        <Col className={"pr-0"}>
                            <CardTitle><a href={assignmentLink}>{board.title}</a></CardTitle>
                            <CardSubtitle>By: <strong>{formatBoardOwner(user, board)}</strong></CardSubtitle>
                        </Col>
                        <Col className="card-share-link col-auto">
                            <ShareLink linkUrl={assignmentLink} gameboardId={board.id} reducedWidthLink clickAwayClose />
                        </Col>
                    </Row>
                </CardBody>
                <CardFooter>
                    <Button className={"mb-1"} block color="tertiary" onClick={toggleAssignModal}>{"Assign / Unassign"}</Button>
                </CardFooter>
            </Card>
        }
    </>;
};

const SetAssignmentsPageComponent = (props: SetAssignmentsPageProps) => {
    const {groups, loadGroups, loadAssignmentsOwnedByMe, openIsaacBooksModal} = props;

    const user = useSelector((state: AppState) => (state && state.user) as RegisteredUserDTO || null);

    const assignmentsSetByMe = useSelector(selectors.assignments.setByMe);
    const groupsByGameboard = useMemo<{[gameboardId: string]: BoardAssignee[]}>(() =>
        assignmentsSetByMe?.reduce((acc, assignment) => {
            if (!isDefined(assignment?.gameboardId) || !isDefined(assignment?.groupId)) return acc;
            const newAssignee = {groupId: assignment.groupId, groupName: assignment.groupName};
            if (acc[assignment.gameboardId] == undefined) {
                return {...acc, [assignment.gameboardId]: [newAssignee]};
            }
            return {...acc, [assignment.gameboardId]: [...acc[assignment.gameboardId], newAssignee]};
        }, {} as {[gameboardId: string]: BoardAssignee[]}) ?? {},
        [assignmentsSetByMe]);

    useEffect(() => {
        loadGroups(false);
        loadAssignmentsOwnedByMe();
    }, []);

    const [boardCreator, setBoardCreator] = useState<BoardCreators>(BoardCreators.all);
    const [boardSubject, setBoardSubject] = useState<BoardSubjects>(BoardSubjects.all);

    const {
        boards, loading, viewMore,
        boardOrder, setBoardOrder,
        boardView, setBoardView,
        boardLimit, setBoardLimit,
        boardTitleFilter, setBoardTitleFilter
    } = useGameboards(BoardViews.card, BoardLimit.six);

    const isaacAssignmentButtons = {
        second: {
            link: siteSpecific("/pages/pre_made_gameboards", "/topics"),
            text: siteSpecific("our Boards for Lessons", "Topics list")
        },
        third: {
            text: siteSpecific("create a gameboard", "Create gameboard")
        }
    };

    const switchView = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setBoardView(e.target.value as BoardViews);
    }, [setBoardView]);

    const pageHelp = <span>
        Use this page to set assignments to your groups. You can assign any gameboard you have saved to your account.
        <br />
        Students in the group will be emailed when you set a new assignment.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="Set assignments" help={pageHelp} modalId="set_assignments_help"/>
        <h4 className="mt-4 mb-3">
            Add a gameboard from ...
        </h4>
        <Row className="mb-4">
            <Col md={6} lg={4} className="pt-1">
                {siteSpecific(
                    // Physics
                    <Button tag={Link} onClick={openIsaacBooksModal} color="secondary" block className="px-3">
                        our books
                    </Button>,
                    // Computer science
                    <Button tag={Link} to={"/pages/gameboards"} color="secondary" block>
                        Pre-made gameboards
                    </Button>
                )}
            </Col>
            <Col md={6} lg={4} className="pt-1">
                <Button tag={Link} to={isaacAssignmentButtons.second.link} color="secondary" block>
                    {isaacAssignmentButtons.second.text}
                </Button>
            </Col>
            <Col md={12} lg={4} className="pt-1">
                <Button tag={Link} to={"/gameboard_builder"} color="secondary" block>
                    {isaacAssignmentButtons.third.text}
                </Button>
            </Col>
        </Row>
        {groups && groups.length == 0 && <Alert color="warning">You have not created any groups to assign work to. Please <Link to="/groups">create a group here first.</Link></Alert>}
        {boards && boards.totalResults == 0 ? <h3 className="text-center mt-4 mb-5">You have no gameboards to assign; use one of the options above to find one.</h3> :
            <>
                {boards && boards.totalResults > 0 && <h4>You have <strong>{boards.totalResults}</strong> gameboard{boards.totalResults > 1 && "s"} ready to assign...</h4>}
                {!boards && <h4>You have <IsaacSpinner size="sm" inline /> gameboards ready to assign...</h4>}
                <Row>
                    <Col sm={6} lg={3} xl={2}>
                        <Label className="w-100">
                            Display in <Input type="select" value={boardView} onChange={switchView}>
                            {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                        </Input>
                        </Label>
                    </Col>
                    <div className="d-lg-none w-100" />
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
                                    {boards.boards && boards.boards.map(board => <Col>
                                        <Board {...props}
                                           key={board.id}
                                           board={board}
                                           boardView={boardView}
                                           assignees={(isDefined(board?.id) && groupsByGameboard[board.id]) || []}
                                        />
                                    </Col>)}
                                </Row>
                                <div className="text-center mt-3 mb-4" style={{clear: "both"}}>
                                    <p>Showing <strong>{boards.boards.length}</strong> of <strong>{boards.totalResults}</strong></p>
                                    {boards.boards.length < boards.totalResults && <Button onClick={viewMore} disabled={loading}>{loading ? <Spinner/> : "View more"}</Button>}
                                </div>
                            </>
                            :
                            // Table view
                            <Card className="mt-2 mb-5">
                                <CardBody id="boards-table">
                                    <Row>
                                        <Col lg={4}>
                                            <Label className="w-100">
                                                Filter boards <Input type="text" onChange={(e) => setBoardTitleFilter(e.target.value)} placeholder="Filter boards by name"/>
                                            </Label>
                                        </Col>
                                        {isPhy && <Col sm={6} lg={2}>
                                            <Label className="w-100">
                                                Subject <Input type="select" value={boardSubject} onChange={e => setBoardSubject(e.target.value as BoardSubjects)}>
                                                {Object.values(BoardSubjects).map(subject => <option key={subject} value={subject}>{subject}</option>)}
                                            </Input>
                                            </Label>
                                        </Col>}
                                        <Col lg={siteSpecific(2, {size: 2, offset: 6})}>
                                            <Label className="w-100">
                                                Creator <Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                                                {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
                                                </Input>
                                            </Label>
                                        </Col>
                                    </Row>

                                    <div className="overflow-auto mt-3">
                                        <Table className="mb-0">
                                            <thead>
                                            <tr>
                                                <th className="text-center align-middle"><span className="pl-2 pr-2">Groups</span></th>
                                                <th className="align-middle pointer-cursor">
                                                    <button className="table-button" onClick={() => boardOrder == BoardOrder.title ? setBoardOrder(BoardOrder["-title"]) : setBoardOrder(BoardOrder.title)}>
                                                        Board name {boardOrder == BoardOrder.title ? sortIcon.ascending : boardOrder == BoardOrder["-title"] ? sortIcon.descending : sortIcon.sortable}
                                                    </button>
                                                </th>
                                                <th className="text-center align-middle">Difficulties</th>
                                                <th className="text-center align-middle">Creator</th>
                                                <th className="text-center align-middle pointer-cursor">
                                                    <button className="table-button" onClick={() => boardOrder == BoardOrder.created ? setBoardOrder(BoardOrder["-created"]) : setBoardOrder(BoardOrder.created)}>
                                                        Created {boardOrder == BoardOrder.created ? sortIcon.ascending : boardOrder == BoardOrder["-created"] ? sortIcon.descending : sortIcon.sortable}
                                                    </button>
                                                </th>
                                                <th className="text-center align-middle pointer-cursor">
                                                    <button className="table-button" onClick={() => boardOrder == BoardOrder.visited ? setBoardOrder(BoardOrder["-visited"]) : setBoardOrder(BoardOrder.visited)}>
                                                        Last viewed {boardOrder == BoardOrder.visited ? sortIcon.ascending : boardOrder == BoardOrder["-visited"] ? sortIcon.descending : sortIcon.sortable}
                                                    </button>
                                                </th>
                                                <th className="text-center align-middle">Assignments</th>
                                                <th className="text-center align-middle">Share</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {boards.boards
                                                .filter(board => board.title && board.title.toLowerCase().includes(boardTitleFilter.toLowerCase())
                                                    && (formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
                                                    && (boardSubject == "All" || (determineGameboardSubjects(board).includes(boardSubject.toLowerCase()))))
                                                .map(board =>
                                                    <Board
                                                        {...props}
                                                        key={board.id}
                                                        board={board}
                                                        boardView={boardView}
                                                        boards={boards}
                                                        assignees={board.id ? groupsByGameboard[board.id] : []}
                                                    />)
                                            }
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Card>}
                        </div>}
                </ShowLoading>
            </>}
    </Container>;
};

export const SetAssignments = withRouter(connect(stateToProps, dispatchToProps)(SetAssignmentsPageComponent)); // Cautious about removing connect as there is a promise then callback on assignBoard
