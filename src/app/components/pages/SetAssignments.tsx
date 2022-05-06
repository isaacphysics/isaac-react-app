import React, {ChangeEvent, useEffect, useState} from "react";
import * as RS from "reactstrap";
import {
    Alert,
    Button,
    Card,
    CardBody,
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
    loadBoards,
    loadGroups,
    loadGroupsForBoard,
    openIsaacBooksModal,
    showToast,
    unassignBoard
} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {ActualBoardLimit, AppGameBoard, BoardOrder, Boards, Toast} from "../../../IsaacAppTypes";
import {GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import {selectors} from "../../state/selectors";
import {range, sortBy} from "lodash";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {currentYear, DateInput} from "../elements/inputs/DateInput";
import {
    allPropertiesFromAGameboard,
    determineGameboardSubjects,
    formatBoardOwner,
    generateGameboardSubjectHexagons
} from "../../services/gameboards";
import {connect, useDispatch, useSelector} from "react-redux";
import {formatDate} from "../elements/DateString";
import {ShareLink} from "../elements/ShareLink";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {isAdminOrEventManager, isStaff} from "../../services/user";
import {isDefined} from "../../services/miscUtils";
import {
    difficultiesOrdered,
    sortIcon,
    stageLabelMap,
    stagesOrdered
} from "../../services/constants";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {AggregateDifficultyIcons} from "../elements/svg/DifficultyIcons";
import {above, below, useDeviceSize} from "../../services/device";
import Select from "react-select";
import {selectOnChange, itemise, Item} from "../../services/select";

enum boardViews {
    "table" = "Table View",
    "card" = "Card View"
}

const stateToProps = (state: AppState) => ({
    user: (state && state.user) as RegisteredUserDTO,
    groups: selectors.groups.active(state),
    boards: selectors.boards.boards(state)
});

const dispatchToProps = {loadGroups, loadBoards, loadGroupsForBoard, deleteBoard, assignBoard, unassignBoard, showToast, openIsaacBooksModal};

interface SetAssignmentsPageProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
    groups: UserGroupDTO[] | null;
    loadGroups: (getArchived: boolean) => void;
    loadBoards: (startIndex: number, limit: ActualBoardLimit, sort: BoardOrder) => void;
    loadGroupsForBoard: (board: GameboardDTO) => void;
    deleteBoard: (board: GameboardDTO) => void;
    assignBoard: (board: GameboardDTO, groups: Item<number>[], dueDate?: Date, assignmentNotes?: string) => Promise<boolean>;
    unassignBoard: (board: GameboardDTO, group: UserGroupDTO) => void;
    showToast: (toast: Toast) => void;
    location: {hash: string};
    openIsaacBooksModal: () => void;
}

type BoardProps = SetAssignmentsPageProps & {
    board: AppGameBoard;
    boardView: boardViews;
}

const AssignGroup = ({groups, board, assignBoard}: BoardProps) => {
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date>();
    const [assignmentNotes, setAssignmentNotes] = useState<string>();
    const user = useSelector(selectors.user.orNull);

    function assign() {
        assignBoard(board, selectedGroups, dueDate, assignmentNotes).then(success => {
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
            block color={{[SITE.CS]: "primary", [SITE.PHY]: "secondary"}[SITE_SUBJECT]}
            onClick={assign}
            disabled={selectedGroups.length === 0 || (isDefined(assignmentNotes) && assignmentNotes.length > 500)}
        >Assign to group{selectedGroups.length > 1 ? "s" : ""}</Button>
    </Container>;
};

const Board = (props: BoardProps) => {
    const {user, board, boardView, loadGroupsForBoard, deleteBoard, unassignBoard, showToast, location: {hash}} = props;
    const hashAnchor = hash.includes("#") ? hash.slice(1) : "";
    const deviceSize = useDeviceSize();

    useEffect(() => {loadGroupsForBoard(board);}, [board.id]);

    const assignmentLink = `/assignment/${board.id}`;

    const hasAssignedGroups = board.assignedGroups && board.assignedGroups.length > 0;

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
            deleteBoard(board);
        }
    }

    function confirmUnassignBoard(group: UserGroupDTO) {
        if (confirm("Are you sure you want to unassign this gameboard from this group?")) {
            unassignBoard(board, group);
        }
    }

    const [showAssignments, setShowAssignments] = useState(board.id === hashAnchor);
    const [modal, setModal] = useState(false);

    const toggleAssignModal = () => setModal(s => !s);
    const toggleAssignCard = () => setShowAssignments(s => !s);

    const hexagonId = `board-hex-${board.id}`;

    const boardSubjects = determineGameboardSubjects(board);
    const boardStages = allPropertiesFromAGameboard(board, "stage", stagesOrdered);
    const boardDifficulties = allPropertiesFromAGameboard(board, "difficulty", difficultiesOrdered);

    return boardView == boardViews.table ?
        // Table view
        <>
            <tr key={board.id} className="board-card">
                <td>
                    <div className="board-subject-hexagon-container table-view">
                        <button onClick={toggleAssignModal} id={hexagonId} className="board-subject-hexagon-container">
                            {generateGameboardSubjectHexagons(boardSubjects)}
                            <span className="groups-assigned">
                                <strong>{board.assignedGroups ? board.assignedGroups.length : <Spinner size="sm" />}</strong>
                                group{(!board.assignedGroups || board.assignedGroups.length != 1) && "s"}
                                {board.assignedGroups &&
                                <UncontrolledTooltip target={"#" + hexagonId}>{board.assignedGroups.length === 0 ?
                                    "No groups have been assigned."
                                    : ("Gameboard assigned to: " + board.assignedGroups.map(g => g.groupName).join(", "))}
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
            <Modal isOpen={modal} toggle={toggleAssignModal}>
                <ModalHeader close={
                    <button className="close" onClick={toggleAssignModal}>
                            {"Close"}
                    </button>
                }>
                    Assign / Unassign
                </ModalHeader>
                <ModalBody>
                    <p className="px-1"> Manage assignment of groups to gameboard: {board.title}</p>
                    <hr className="text-center" />
                    <AssignGroup {...props} />
                    <hr className="text-center" />
                    <div className="py-2">
                        <Label>Board currently assigned to:</Label>
                        {board.assignedGroups && hasAssignedGroups && <Container className="mb-4">{board.assignedGroups.map(group =>
                            <Row key={group.id} className="px-1">
                                <span className="flex-grow-1">{group.groupName}</span>
                                <button className="close" aria-label="Unassign group" onClick={() => confirmUnassignBoard(group)}>×</button>
                            </Row>
                        )}</Container>}
                        {!hasAssignedGroups && <p>No groups.</p>}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button block color="tertiary" onClick={toggleAssignModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </>
        :
        // Card view
        <div key={board.id}>
            <Card className="board-card">
                <CardBody className="pb-4 pt-4">
                    <button className="close" onClick={confirmDeleteBoard} aria-label="Delete gameboard">×</button>
                    <button onClick={toggleAssignCard} id={hexagonId} className="board-subject-hexagon-container">
                        {generateGameboardSubjectHexagons(boardSubjects)}
                        <span className="groups-assigned">
                            <strong>{board.assignedGroups ? board.assignedGroups.length : <IsaacSpinner size="sm" />}</strong>
                            group{(!board.assignedGroups || board.assignedGroups.length != 1) && "s"}
                            {board.assignedGroups &&
                            <UncontrolledTooltip target={"#" + hexagonId}>{board.assignedGroups.length === 0 ?
                                "No groups have been assigned."
                                : ("Gameboard assigned to: " + board.assignedGroups.map(g => g.groupName).join(", "))}
                            </UncontrolledTooltip>
                            }
                        </span>
                    </button>
                    <aside>
                        <CardSubtitle>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                        <CardSubtitle>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
                        <CardSubtitle>Stages: <strong className="d-inline-flex">{boardStages.length > 0 ? boardStages.map(s => stageLabelMap[s]).join(', ') : "N/A"}</strong></CardSubtitle>
                        {boardDifficulties.length > 1 && <CardSubtitle>
                            {"Difficulties: "}
                            <AggregateDifficultyIcons stacked={above["lg"](deviceSize) || below["xs"](deviceSize)} difficulties={boardDifficulties} />
                        </CardSubtitle>}
                    </aside>

                    <Row className="mt-1 mb-3">
                        <Col className={"pr-0"}>
                            <CardTitle><a href={assignmentLink}>{board.title}</a></CardTitle>
                            <CardSubtitle>By: <strong>{formatBoardOwner(user, board)}</strong></CardSubtitle>
                        </Col>
                        <Col className="card-share-link col-auto">
                            <ShareLink linkUrl={assignmentLink} gameboardId={board.id} reducedWidthLink clickAwayClose />
                        </Col>
                    </Row>
                    {showAssignments && <>
                        <hr className="text-center" />
                        <AssignGroup {...props} />
                        <hr className="text-center" />
                        <div className="py-2">
                            <Label>Board currently assigned to:</Label>
                            {board.assignedGroups && hasAssignedGroups && <Container className="mb-4">{board.assignedGroups.map(group =>
                                <Row key={group.id} className="px-1">
                                    <span className="flex-grow-1">{group.groupName}</span>
                                    <button className="close" aria-label="Unassign group" onClick={() => confirmUnassignBoard(group)}>×</button>
                                </Row>
                            )}</Container>}
                            {!hasAssignedGroups && <p>No groups.</p>}
                        </div>
                    </>}
                    <Button block color="tertiary" onClick={toggleAssignCard}>{showAssignments ? "Close" : "Assign / Unassign"}</Button>
                </CardBody>
            </Card>
        </div>;
};

enum boardCreators {
    "all" = "All",
    "isaac" = "Isaac",
    "me" = "Me",
    "someoneelse" = "Someone else"
}

enum boardSubjects {
    "all" = "All",
    "physics" = "Physics",
    "maths" = "Maths",
    "chemistry" = "Chemistry"
}

enum BoardLimit {
    "six" = "6",
    "eighteen" = "18",
    "sixy" = "60",
    "All" = "ALL"
}
function toActual(limit: BoardLimit) {
    if (limit == "ALL") return "ALL";
    return parseInt(limit, 10);
}

const orderNames: {[key in BoardOrder]: string} = {
    "created": "Date Created Ascending",
    "-created": "Date Created Descending",
    "visited": "Date Visited Ascending",
    "-visited": "Date Visited Descending",
    "title": "Title Ascending",
    "-title": "Title Descending",
    "completion": "Completion Ascending",
    "-completion": "Completion Descending"
};
function orderName(order: BoardOrder) {
    return orderNames[order];
}

const SetAssignmentsPageComponent = (props: SetAssignmentsPageProps) => {
    const {groups, loadGroups, boards, loadBoards, openIsaacBooksModal} = props;

    const user = useSelector((state: AppState) => (state && state.user) as RegisteredUserDTO || null);

    useEffect(() => {loadGroups(false);}, []);

    const [loading, setLoading] = useState(false);

    const [boardLimit, setBoardLimit] = useState<BoardLimit>(BoardLimit.six);
    const [boardOrder, setBoardOrder] = useState<BoardOrder>(BoardOrder.visited);
    const [boardView, setBoardView] = useState(boardViews.card);
    const [boardCreator, setBoardCreator] = useState<boardCreators>(boardCreators.all);
    const [boardSubject, setBoardSubject] = useState<boardSubjects>(boardSubjects.all);
    const [boardTitleFilter, setBoardTitleFilter] = useState<string>("");

    let [actualBoardLimit, setActualBoardLimit] = useState<ActualBoardLimit>(toActual(boardLimit));

    const dispatch = useDispatch();


    const isaacAssignmentButtons = {
        second: {
            link: {
                [SITE.CS]: "/topics",
                [SITE.PHY]: "/pages/pre_made_gameboards"
            },
            text: {
                [SITE.CS]: "Topics list",
                [SITE.PHY]: "our Boards for Lessons"
            }
        },
        third: {
            text: {
                [SITE.CS]: "Create gameboard",
                [SITE.PHY]: "create a gameboard"
            }
        }
    };

    function loadInitial() {
        loadBoards(0, actualBoardLimit, boardOrder);
        setLoading(true);
    }

    useEffect( () => {
        if (actualBoardLimit != boardLimit) {
            setActualBoardLimit(actualBoardLimit = toActual(boardLimit));
            loadInitial();
        }
    }, [boardLimit]);

    useEffect(() => {
        if (boardView == boardViews.table) {
            setBoardLimit(BoardLimit.All)
        } else if (boardView == boardViews.card) {
            setBoardLimit(BoardLimit.six)
        }
    }, [boardView]);

    useEffect( loadInitial, [boardOrder]);

    function viewMore() {
        const increment = toActual(boardLimit);
        if (increment != "ALL" && actualBoardLimit != "ALL") {
            loadBoards(actualBoardLimit, increment, boardOrder);
            setLoading(true);
        }
    }

    function switchView(e: React.ChangeEvent<HTMLInputElement>) {
        setBoardView(e.target.value as boardViews);
    }

    useEffect( () => {
        if (boards) {
            const wasLoading = loading;
            setLoading(false);
            if (boards.boards) {
                if (actualBoardLimit != boards.boards.length) {
                    setActualBoardLimit(actualBoardLimit = boards.boards.length);
                    if (!wasLoading && boards.boards.length == 0) {
                        // Through deletion or something we have ended up with no boards, so fetch more.
                        viewMore();
                    }
                }
            }
        }
    }, [boards]);

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
        <RS.Row className="mb-4">
            <RS.Col md={6} lg={4} className="pt-1">
                {SITE_SUBJECT === SITE.PHY ?
                    <RS.Button tag={Link} onClick={() => dispatch(openIsaacBooksModal)} color="secondary" block className="px-3">
                        our GCSE &amp; A Level books
                    </RS.Button> :
                    <RS.Button tag={Link} to={"/pages/gameboards"} color="secondary" block>
                        Pre-made gameboards
                    </RS.Button>
                }
            </RS.Col>
            <RS.Col md={6} lg={4} className="pt-1">
                <RS.Button tag={Link} to={isaacAssignmentButtons.second.link[SITE_SUBJECT]} color="secondary" block>
                    {isaacAssignmentButtons.second.text[SITE_SUBJECT]}
                </RS.Button>
            </RS.Col>
            <RS.Col md={12} lg={4} className="pt-1">
                <RS.Button tag={Link} to={"/gameboard_builder"} color="secondary" block>
                    {isaacAssignmentButtons.third.text[SITE_SUBJECT]}
                </RS.Button>
            </RS.Col>
        </RS.Row>
        {groups && groups.length == 0 && <Alert color="warning">You have not created any groups to assign work to. Please <Link to="/groups">create a group here first.</Link></Alert>}
        {boards && boards.totalResults == 0 ? <h3 className="text-center mt-4 mb-5">You have no gameboards to assign; use one of the options above to find one.</h3> :
            <React.Fragment>
                {boards && boards.totalResults > 0 && <h4>You have <strong>{boards.totalResults}</strong> gameboard{boards.totalResults > 1 && "s"} ready to assign...</h4>}
                {!boards && <h4>You have <IsaacSpinner size="sm" /> gameboards ready to assign...</h4>}
                <Row>
                    <Col sm={6} lg={3} xl={2}>
                        <Label className="w-100">
                            Display in <Input type="select" value={boardView} onChange={switchView}>
                            {Object.values(boardViews).map(view => <option key={view} value={view}>{view}</option>)}
                        </Input>
                        </Label>
                    </Col>
                    <div className="d-lg-none w-100" />
                    {boardView === boardViews.card &&
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
                                {Object.values(BoardOrder).map(order => <option key={order} value={order}>{orderName(order)}</option>)}
                            </Input>
                            </Label>
                        </Col>
                    </>}
                </Row>
                <ShowLoading until={boards}>
                    {boards && boards.boards && <div>
                        {boardView == boardViews.card ?
                            // Card view
                            <>
                                <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
                                    {boards.boards && boards.boards.map(board =>
                                        <Board {...props}
                                                   key={board.id}
                                                   board={board}
                                                   boardView={boardView}
                                        />)}
                                </div>
                                <div className="text-center mt-2 mb-4" style={{clear: "both"}}>
                                    <p>Showing <strong>{boards.boards.length}</strong> of <strong>{boards.totalResults}</strong></p>
                                    {boards.boards.length < boards.totalResults && <Button onClick={viewMore} disabled={loading}>{loading ? <Spinner /> : "View more"}</Button>}
                                </div>
                            </>
                            :
                            // Table view
                            <>
                                <Card className="mt-2 mb-5">
                                    <CardBody id="boards-table">
                                        <Row>
                                            <Col lg={4}>
                                                <Label className="w-100">
                                                    Filter boards <Input type="text" onChange={(e) => setBoardTitleFilter(e.target.value)} placeholder="Filter boards by name"/>
                                                </Label>
                                            </Col>
                                            {SITE_SUBJECT == SITE.PHY && <Col sm={6} lg={2}>
                                                <Label className="w-100">
                                                    Subject <Input type="select" value={boardSubject} onChange={e => setBoardSubject(e.target.value as boardSubjects)}>
                                                    {Object.values(boardSubjects).map(subject => <option key={subject} value={subject}>{subject}</option>)}
                                                </Input>
                                                </Label>
                                            </Col>}
                                            <Col lg={SITE_SUBJECT == SITE.PHY ? 2 : {size: 2, offset: 6}}>
                                                <Label className="w-100">
                                                    Creator <Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as boardCreators)}>
                                                    {Object.values(boardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
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
                                                        />)
                                                }
                                                </tbody>
                                            </Table>
                                        </div>
                                    </CardBody>
                                </Card>
                            </>}
                        </div>}
                </ShowLoading>
            </React.Fragment>}
    </Container>;
};

export const SetAssignments = withRouter(connect(stateToProps, dispatchToProps)(SetAssignmentsPageComponent)); // Cautious about removing connect as there is a promise then callback on assignBoard
