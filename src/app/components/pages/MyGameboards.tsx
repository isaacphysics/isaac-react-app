import React, {useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {deleteBoard, loadBoards} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState, Boards} from "../../state/reducers";
import {
    Button,
    Card,
    CardBody,
    CardSubtitle,
    CardTitle,
    Col,
    Container,
    CustomInput,
    Form,
    Input,
    Label,
    Row,
    Spinner,
    Table
} from 'reactstrap';
import {ActualBoardLimit, AppGameBoard, BoardOrder} from "../../../IsaacAppTypes";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {boards as ThisBoards} from "../../state/selectors";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {sortIcon, STUDENTS_CRUMB} from "../../services/constants";
import {formatBoardOwner} from "../../services/gameboards";
import {isMobile} from "../../services/device";
import {formatDate} from "../elements/DateString";

interface MyBoardsPageProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
}

enum boardCreators {
    "all" = "All",
    "isaac" = "Isaac",
    "me" = "Me",
    "someoneelse" = "Someone else"
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
    const {user, board, setSelectedBoards, selectedBoards, boardView} = props;

    const boardLink = `${window.location.origin}/gameboards#${board.id}`;

    const dispatch = useDispatch();
    const [showShareLink, setShowShareLink] = useState(false);
    const shareLink = useRef<HTMLInputElement>(null);

    const hexagonId = `board-hex-${board.id}`;

    const updateBoardSelection = (board: AppGameBoard, checked: boolean) => {
        if (checked) {
            setSelectedBoards([...selectedBoards, board]);
        } else {
            setSelectedBoards(selectedBoards.filter((thisBoard) => thisBoard.id !== board.id));
        }
    };

    function toggleShareLink() {
        if (showShareLink) {
            setShowShareLink(false);
        } else {
            setShowShareLink(true);
            setTimeout(() => {
                if (shareLink.current) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(shareLink.current);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            });
        }
    }

    function confirmCardDeleteBoard() {
        if (confirm(`Are you sure you want to remove '${board.title}' from your account?`)) {
            dispatch(deleteBoard(board));
        }
    }

    return boardView == boardViews.table ?
        <tr key={board.id} className="board-card">
            <td><div className="subject-compsci-table groups-assigned myBoardsTable-percentageCompleted" id={hexagonId}>
                <h4>{board.percentageCompleted}</h4>
            </div></td>
            <td><a href={boardLink}>{board.title}</a></td>
            {/*<td className="text-center">{board.levels.join(' ')}</td>*/}
            <td className="text-center">{formatBoardOwner(user, board)}</td>
            <td className="text-center">{formatDate(board.creationDate)}</td>
            <td className="text-center">{formatDate(board.lastVisited)}</td>
            <td><div className={`share-link-table ${showShareLink ? "d-block" : ""}`}><div ref={shareLink}>{boardLink}</div></div>
                <button className="ru_share" onClick={toggleShareLink}/></td>
            <td><CustomInput id={`board-delete-${board.id}`} type="checkbox" checked={board && (selectedBoards.some(e => e.id === board.id))}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    board && updateBoardSelection(board, event.target.checked)
                }} aria-label="Delete gameboard"/></td>
        </tr>:
        <Card className="board-card">
            <CardBody className="pb-4 pt-4">
                <button className="close" onClick={confirmCardDeleteBoard} aria-label="Delete gameboard">×</button>
                <button className="groups-assigned subject-compsci myBoards-percentageCompleted" id={hexagonId}>
                    <h4>{board.percentageCompleted}</h4>
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

export const MyGameboards = () => {
    //Redux state and dispatch
    const dispatch = useDispatch();
    const boards = useSelector((state: AppState) => ThisBoards.boards(state) as Boards);
    const user = useSelector((state: AppState) => (state && state.user) as RegisteredUserDTO || null);

    const [boardOrder, setBoardOrder] = useState<BoardOrder>(BoardOrder.visited);
    const [loading, setLoading] = useState(false);
    const [boardView, setBoardView] = useState(isMobile() ? boardViews.card : boardViews.table);
    const [boardLimit, setBoardLimit] = useState<BoardLimit>(boardView == boardViews.table ? BoardLimit.All : BoardLimit.six);
    const [boardTitleFilter, setBoardTitleFilter] = useState<string>("");
    const [selectedBoards, setSelectedBoards] = useState<AppGameBoard[]>([]);
    const [boardCreator, setBoardCreator] = useState<boardCreators>(boardCreators.all);

    let actualBoardLimit: ActualBoardLimit = toActual(boardLimit);

    function loadInitial() {
        dispatch(loadBoards(0, actualBoardLimit, boardOrder));
        setLoading(true);
    }
    useEffect( loadInitial, [boardOrder]);

    useEffect( () => {
        actualBoardLimit = toActual(boardLimit);
        loadInitial();
    }, [boardLimit]);

    useMemo(() => {
        if (boardView == boardViews.table) {
            setBoardLimit(BoardLimit.All)
        } else if (boardView == boardViews.card) {
            setBoardLimit(BoardLimit.six)
        }
    }, [boardView]);

    function confirmDeleteMultipleBoards() {
        if (confirm(`Are you sure you want to remove ${selectedBoards && selectedBoards.length > 1 ? selectedBoards.length + " boards" : selectedBoards[0].title} from your account?`)) {
            selectedBoards && selectedBoards.map(board => dispatch(deleteBoard(board)));
            setSelectedBoards([]);
        }
    }

    function switchView(e: any) {
        setSelectedBoards([]);
        setBoardView(e.target.value as boardViews);
    }

    function viewMore() {
        const increment = toActual(boardLimit);
        if (increment != "ALL" && actualBoardLimit != "ALL") {
            dispatch(loadBoards(actualBoardLimit, increment, boardOrder));
            setLoading(true);
        }
    }

    useEffect( () => {
        if (boards && boards.totalResults != 0) {
            const wasLoading = loading;
            setLoading(false);
            if (boards.boards) {
                if (actualBoardLimit != boards.boards.length) {
                    actualBoardLimit = (boards.boards.length);
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

    // @ts-ignore
    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My gameboards" intermediateCrumbs={[STUDENTS_CRUMB]} help={pageHelp} />
        {boards && boards.totalResults == 0 ? <h3 className="text-center mt-4 mb-5">You have no gameboards to view.</h3> :
            <React.Fragment>
                {boards && boards.totalResults > 0 && <h4>You have <strong>{boards.totalResults}</strong> gameboard{boards.totalResults > 1 && "s"} saved...</h4>}
                {!boards && <h4>You have <Spinner size="sm" /> saved gameboards...</h4>}
                <Row>
                    <Col>
                        <Form inline className="input-options input-align" onSubmit={e => e.preventDefault()}>
                            <span className="flex-grow-1" />
                            <Label>Display in <Input className="ml-2 mr-2 input-align" type="select" value={boardView} onChange={e => switchView(e)}>
                                {Object.values(boardViews).map(view => <option key={view} value={view}>{view}</option>)}
                            </Input></Label>
                            {boardView !== boardViews.table &&
                            <Label>Show <Input className="ml-2 mr-2 input-align" type="select" value={boardLimit} onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                                {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                            </Input></Label>}
                            {boardView !== boardViews.table &&
                            <Label>Sort by <Input className="ml-2 mr-2 input-align" type="select" value={boardOrder} onChange={e => setBoardOrder(e.target.value as BoardOrder)}>
                                {Object.values(BoardOrder).map(order => <option key={order} value={order}>{orderName(order)}</option>)}
                            </Input></Label>}
                        </Form>
                    </Col>
                </Row>
                <ShowLoading until={boards}>
                    {boards && boards.boards && <div>
                        {boardView == boardViews.card ?
                            // Card view
                            <div className="block-grid-xs-1 block-grid-md-2 block-grid-lg-3 my-2">
                                {boards.boards.map(board => <div key={board.id}>
                                    <Board
                                        key={board.id}
                                        board={board}
                                        selectedBoards={selectedBoards}
                                        setSelectedBoards={setSelectedBoards}
                                        boardView={boardView}
                                        user={user}
                                        boards={boards}
                                    />
                                </div>)}
                            </div>
                            :
                            // Table view
                            <div>
                                <Row className="align-content-center">
                                    <Col md={3}>
                                        <Label>Filter boards <Input type="text" onChange={(e) => setBoardTitleFilter(e.target.value)} placeholder="Filter boards by name"/></Label>
                                    </Col>
                                    <Col md={2}>
                                        <Label>Creator <Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as boardCreators)}>
                                            {Object.values(boardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
                                        </Input></Label>
                                    </Col>
                                    <Col md={7}>
                                        {selectedBoards && selectedBoards.length > 0 && <div className="m-0"><Button className="float-right mt-4" onClick={confirmDeleteMultipleBoards}>Delete ({selectedBoards.length})</Button></div>}
                                    </Col>
                                </Row>
                                <Card className="my-2 mt-2 mb-4">
                                    <CardBody id="boards-table">
                                        <div className="overflow-auto">
                                            <Table className="mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Completion</th>
                                                        <th className="pointer-cursor">
                                                            <button className="table-button" onClick={() => boardOrder == BoardOrder.title ? setBoardOrder(BoardOrder["-title"]) : setBoardOrder(BoardOrder.title)}>
                                                                Board name {boardOrder == BoardOrder.title ? sortIcon.ascending : boardOrder == BoardOrder["-title"] ? sortIcon.descending : sortIcon.sortable}
                                                            </button>
                                                        </th>
                                                        {/*<th className="text-center">Levels</th>*/}
                                                        <th className="text-center">Creator</th>
                                                        <th className="text-center pointer-cursor">
                                                            <button className="table-button" onClick={() => boardOrder == BoardOrder.created ? setBoardOrder(BoardOrder["-created"]) : setBoardOrder(BoardOrder.created)}>
                                                                Created {boardOrder == BoardOrder.created ? sortIcon.ascending : boardOrder == BoardOrder["-created"] ? sortIcon.descending : sortIcon.sortable}
                                                            </button>
                                                        </th>
                                                        <th className="text-center pointer-cursor">
                                                            <button className="table-button" onClick={() => boardOrder == BoardOrder.visited ? setBoardOrder(BoardOrder["-visited"]) : setBoardOrder(BoardOrder.visited)}>
                                                                Last viewed {boardOrder == BoardOrder.visited ? sortIcon.ascending : boardOrder == BoardOrder["-visited"] ? sortIcon.descending : sortIcon.sortable}
                                                            </button>
                                                        </th>
                                                        <th></th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {boards.boards
                                                        .filter(board => board.title && board.title.toLowerCase().includes(boardTitleFilter.toLowerCase())
                                                        && (formatBoardOwner(user, board) == boardCreator || boardCreator == "All"))
                                                        .map(board =>
                                                            <Board
                                                                key={board.id}
                                                                board={board}
                                                                selectedBoards={selectedBoards}
                                                                setSelectedBoards={setSelectedBoards}
                                                                boardView={boardView}
                                                                user={user}
                                                                boards={boards}
                                                            />)
                                                    }
                                                </tbody>
                                            </Table>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>}
                    </div>}
                </ShowLoading>
            </React.Fragment>}
    </Container>;
};
