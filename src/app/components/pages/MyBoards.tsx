import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {deleteBoard, loadBoards, loadGroups, loadGroupsForBoard, showToast} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState, Boards} from "../../state/reducers";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardSubtitle,
    CardTitle,
    Col,
    Container,
    Form,
    Input,
    Label,
    Row,
    Spinner,
    Table
} from 'reactstrap';
import {ActualBoardLimit, AppGameBoard, BoardOrder, Toast} from "../../../IsaacAppTypes";
import {GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import {boards, groups} from "../../state/selectors";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {STUDENTS_CRUMB} from "../../services/constants";
import {formatBoardOwner, formatDate} from "../../services/gameboards";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) as RegisteredUserDTO,
    groups: groups.active(state),
    boards: boards.boards(state)
});

const dispatchToProps = {loadGroups, loadBoards, loadGroupsForBoard, deleteBoard, showToast};

interface MyBoardsPageProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
    groups: UserGroupDTO[] | null;
    loadGroups: (getArchived: boolean) => void;
    loadBoards: (startIndex: number, limit: ActualBoardLimit, sort: BoardOrder) => void;
    loadGroupsForBoard: (board: GameboardDTO) => void;
    deleteBoard: (board: GameboardDTO) => void;
    showToast: (toast: Toast) => void;
    location: {hash: string};

}

enum BoardLimit {
    "six" = "6",
    "eighteen" = "18",
    "sixy" = "60",
    "All" = "ALL"
}
enum boardViews {
    "table" = "Table View",
    "card" = "Card View"
}

enum sortIcon {
    "sortable" = '⇕',
    "ascending" = '⇑',
    "descending" = '⇓'
}
const orderNames: {[key in BoardOrder]: string} = {
    "created": "Date Created Ascending",
    "-created": "Date Created Descending",
    "visited": "Date Visited Ascending",
    "-visited": "Date Visited Descending",
    "title": "Title Ascending",
    "-title": "Title Descending"
};

type BoardTableProps = MyBoardsPageProps & {
    board: AppGameBoard;
    setSelectedBoards: (e: any) => void;
    selectedBoards: AppGameBoard[];
    boardView: boardViews;
}

const Board = (props: BoardTableProps) => {
    const {user, board, loadGroupsForBoard, deleteBoard, setSelectedBoards, selectedBoards, boardView} = props;

    const boardLink = `${location.origin}/board/${board.id}`;

    useEffect( () => {
        loadGroupsForBoard(board);
    }, [board.id]);
    const [showShareLink, setShowShareLink] = useState(false);
    const shareLink = useRef<HTMLInputElement>(null);
    const hasAssignedGroups = board.assignedGroups && board.assignedGroups.length > 0;
    const hexagonId = `board-hex-${board.id}`;

    const updateBoardSelection = (board: AppGameBoard, checked: boolean) => {
        if (checked) {
            setSelectedBoards([...selectedBoards, board]);
        } else {
            setSelectedBoards(selectedBoards.filter((selectedId) => selectedId !== board));
        }
    };

    function toggleShareLink() {
        if (showShareLink) {
            setShowShareLink(false);
        } else {
            setShowShareLink(true);
            setImmediate(() => {
                if (shareLink.current) {
                    if (window.getSelection && shareLink.current) {
                        let selection = window.getSelection();
                        let range = document.createRange();
                        range.selectNodeContents(shareLink.current);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            });
        }
    }

    function confirmCardDeleteBoard() {
        if (hasAssignedGroups) {
            if (user.role == "ADMIN" || user.role == "EVENT_MANAGER") {
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

    return boardView == boardViews.table ?
        <tr key={board.id} className="board-card">
            <td><button className="groups-assigned subject-compsci-table" id={hexagonId}>
                <strong>{board.percentageCompleted}%</strong>
            </button></td>
            <td><a href={boardLink}>{board.title}</a></td>
            <td className="text-center">{formatBoardOwner(user, board)}</td>
            <td className="text-center">{formatDate(board.creationDate)}</td>
            <td className="text-center">{formatDate(board.lastVisited)}</td>
            <td><div className={`share-link-table ${showShareLink ? "d-block" : ""}`}><div ref={shareLink}>{boardLink}</div></div>
                <button className="ru_share" onClick={toggleShareLink}/></td>
            <td><Input type="checkbox" checked={board && selectedBoards.includes(board) || undefined}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    board && updateBoardSelection(board, event.target.checked)
                }} aria-label="Delete gameboard"/></td>
        </tr>:
        <Card className="board-card">
            <CardBody className="pb-4 pt-4">
                <button className="close" onClick={confirmCardDeleteBoard} aria-label="Delete gameboard">×</button>
                <button className="groups-assigned subject-compsci" id={hexagonId}>
                    <strong>{board.percentageCompleted}%</strong>
                </button>
                <aside>
                    <CardSubtitle>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                    <CardSubtitle>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
                </aside>

                <div className="my-4">
                    <div className={`share-link ${showShareLink ? "d-block" : ""}`}><div ref={shareLink}>{boardLink}</div></div>
                    <button className="ru_share" onClick={toggleShareLink}/>
                    <CardTitle><a href={boardLink}>{board.title}</a></CardTitle>
                    <CardSubtitle>By: <strong>{formatBoardOwner(user, board)}</strong></CardSubtitle>
                </div>
            </CardBody>
        </Card>;
};

function toActual(limit: BoardLimit) {
    if (limit == "ALL") return "ALL";
    return parseInt(limit, 10);
}
function orderName(order: BoardOrder) {
    return orderNames[order];
}

const MyBoardsPageComponent = (props: MyBoardsPageProps) => {
    const {user, loadGroups, boards, loadBoards, deleteBoard} = props;

    useEffect(() => {loadGroups(false);});

    const [loading, setLoading] = useState(false);

    const [boardView, setBoardView] = useState(boardViews.table);
    const [boardLimit, setBoardLimit] = useState<BoardLimit>(boardView == boardViews.table ? BoardLimit.All : BoardLimit.six);
    const [boardOrder, setBoardOrder] = useState<BoardOrder>(BoardOrder.visited);
    const [boardTitleFilter, setBoardTitleFilter] = useState<string>("");
    const [selectedBoards, setSelectedBoards] = useState<AppGameBoard[]>([]);
    const [assignedGroups, setAssignedGroups] = useState();

    let [actualBoardLimit, setActualBoardLimit] = useState<ActualBoardLimit>(toActual(boardLimit));

    function loadInitial() {
        loadBoards(0, actualBoardLimit, boardOrder);
        setLoading(true);
    }

    useEffect(() => {
        selectedBoards && selectedBoards.map(board => board.assignedGroups && board.assignedGroups.length > 0 && setAssignedGroups(true));
    }, [selectedBoards]);

    useEffect( () => {
        if (actualBoardLimit != boardLimit) {
            setActualBoardLimit(actualBoardLimit = toActual(boardLimit));
            loadInitial();
        }
    }, [boardLimit]);

    useEffect( loadInitial, [boardOrder]);

    useEffect(() => {
        if (boardView == boardViews.table) {
            setBoardLimit(BoardLimit.All)
        } else if (boardView == boardViews.card) {
            setBoardLimit(BoardLimit.six)
        }
    }, [boardView]);

    function confirmDeleteMultipleBoards() {
        if (assignedGroups) {
            if (user.role == "ADMIN" || user.role == "EVENT_MANAGER") {
                alert("Warning: You currently have groups assigned to this gameboard. If you delete this your groups will still be assigned but you won't be able to unassign them or see the gameboard in your assigned gameboards or 'My gameboards' page.");
            } else {
                showToast({
                    color: "failure",
                    title: "Gameboard Deletion Not Allowed",
                    body: "You have groups assigned to this gameboard. To delete this gameboard, you must unassign all groups.",
                    timeout: 5000
                });
                return;
            }
        }

        if (confirm(`Are you sure you want to remove ${selectedBoards && selectedBoards.length > 1 ? selectedBoards.length + " boards" : selectedBoards[0].title} from your account?`)) {
            selectedBoards && selectedBoards.map(board => deleteBoard(board));
        }
    }

    function switchView(e: any) {
        setSelectedBoards([]);
        setBoardView(e.target.value as boardViews);
    }

    function viewMore() {
        const increment = toActual(boardLimit);
        if (increment != "ALL" && actualBoardLimit != "ALL") {
            loadBoards(actualBoardLimit, increment, boardOrder);
            setLoading(true);
        }
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
        A summary of your gameboards
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My gameboards" intermediateCrumbs={[STUDENTS_CRUMB]} help={pageHelp} />
        {boards && boards.totalResults == 0 ? <h3 className="text-center mt-4 mb-5">You have no gameboards to view; use one of the options above to find one.</h3> :
            <React.Fragment>
                {boards && boards.totalResults > 0 && <h4>You have <strong>{boards.totalResults}</strong> gameboard{boards.totalResults > 1 && "s"} saved...</h4>}
                {!boards && <h4>You have <Spinner size="sm" /> gameboards saved...</h4>}
                <Row>
                    <Col>
                        <Form inline>
                            <span className="flex-grow-1" />
                            <Label>Display in <Input className="ml-2 mr-3" type="select" value={boardView} onChange={e => switchView(e)}>
                                {Object.values(boardViews).map(view => <option key={view} value={view}>{view}</option>)}
                            </Input></Label>
                            {boardView !== boardViews.table &&
                            <Label>Show <Input className="ml-2 mr-3" type="select" value={boardLimit} onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                                {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                            </Input></Label>}
                            {boardView !== boardViews.table &&
                            <Label>Sort by <Input className="ml-2" type="select" value={boardOrder} onChange={e => setBoardOrder(e.target.value as BoardOrder)}>
                                {Object.values(BoardOrder).map(order => <option key={order} value={order}>{orderName(order)}</option>)}
                            </Input></Label>}
                        </Form>
                    </Col>
                </Row>
                <ShowLoading until={boards}>
                    {boards && boards.boards && <div>
                        {boardView == boardViews.card ?
                            <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
                                {boards.boards && boards.boards.map(board => <div key={board.id}><Board selectedBoards={selectedBoards} setSelectedBoards={setSelectedBoards} boardView={boardView} {...props} board={board} /></div>)}
                            </div>:
                            <Card className="my-2 mt-2 mb-4">
                                <CardHeader className="big-header">
                                    <Row>
                                        <Col md={4}>
                                            <Input className="" type="text" onChange={(e: any) => setBoardTitleFilter(e.target.value)} placeholder="Filter boards by name"/>
                                        </Col>
                                        <Col md={8}>
                                            {selectedBoards && selectedBoards.length > 0 && <Button className="float-right" onClick={confirmDeleteMultipleBoards}>Delete</Button>}
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody id="boards-table">
                                    <div className="overflow-auto">
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>Completion</th>
                                                    <th className="order-heading"><span onClick={() => boardOrder == BoardOrder.title ? setBoardOrder(BoardOrder["-title"]) : setBoardOrder(BoardOrder.title)}>Board name {boardOrder == BoardOrder.title ? sortIcon.ascending : boardOrder == BoardOrder["-title"] ? sortIcon.descending : sortIcon.sortable}</span></th>
                                                    <th className="text-center">Creator</th>
                                                    <th className="text-center order-heading"><span onClick={() => boardOrder == BoardOrder.created ? setBoardOrder(BoardOrder["-created"]) : setBoardOrder(BoardOrder.created)}>Created {boardOrder == BoardOrder.created ? sortIcon.ascending : boardOrder == BoardOrder["-created"] ? sortIcon.descending : sortIcon.sortable}</span></th>
                                                    <th className="text-center order-heading"><span onClick={() => boardOrder == BoardOrder.visited ? setBoardOrder(BoardOrder["-visited"]) : setBoardOrder(BoardOrder.visited)}>Last viewed {boardOrder == BoardOrder.visited ? sortIcon.ascending : boardOrder == BoardOrder["-visited"] ? sortIcon.descending : sortIcon.sortable}</span></th>
                                                    <th></th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {boards.boards && boards.boards.map(board => board.title && board.title.includes(boardTitleFilter) && <Board selectedBoards={selectedBoards} setSelectedBoards={setSelectedBoards} boardView={boardView} {...props} board={board} />)}
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Card>}
                    </div>}
                </ShowLoading>
            </React.Fragment>}
    </Container>;
};

export const MyBoards = withRouter(connect(stateToProps, dispatchToProps)(MyBoardsPageComponent));
