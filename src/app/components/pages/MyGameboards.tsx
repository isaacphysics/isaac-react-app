import React, {useCallback, useEffect, useState} from "react";
import {selectors, unlinkUserFromGameboard, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import * as RS from 'reactstrap';
import {
    Button,
    Card,
    CardBody,
    CardSubtitle,
    CardTitle,
    Col,
    Container,
    CustomInput,
    Input,
    Label,
    Row,
    Spinner,
    Table
} from 'reactstrap';
import {BoardOrder, Boards} from "../../../IsaacAppTypes";
import {GameboardDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    above,
    allPropertiesFromAGameboard,
    below,
    BOARD_ORDER_NAMES,
    BoardCompletions,
    boardCompletionSelection,
    BoardCreators,
    BoardLimit,
    BoardViews,
    determineGameboardSubjects,
    difficultiesOrdered,
    difficultyShortLabelMap,
    formatBoardOwner,
    generateGameboardSubjectHexagons,
    isMobile,
    isPhy,
    siteSpecific,
    sortIcon,
    stageLabelMap,
    stagesOrdered,
    useDeviceSize,
    useGameboards
} from "../../services";
import {formatDate} from "../elements/DateString";
import {ShareLink} from "../elements/ShareLink";
import {Link} from "react-router-dom";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {AggregateDifficultyIcons} from "../elements/svg/DifficultyIcons";

interface MyBoardsPageProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
}

type BoardTableProps = MyBoardsPageProps & {
    board: GameboardDTO;
    setSelectedBoards: (e: any) => void;
    selectedBoards: GameboardDTO[];
    boardView: BoardViews;
}

const Board = (props: BoardTableProps) => {
    const {user, board, setSelectedBoards, selectedBoards, boardView} = props;
    const deviceSize = useDeviceSize();

    const boardLink = `/gameboards#${board.id}`;

    const dispatch = useAppDispatch();

    const updateBoardSelection = (board: GameboardDTO, checked: boolean) => {
        if (checked) {
            setSelectedBoards([...selectedBoards, board]);
        } else {
            setSelectedBoards(selectedBoards.filter((thisBoard) => thisBoard.id !== board.id));
        }
    };

    function confirmCardDeleteBoard() {
        if (confirm(`Are you sure you want to remove '${board.title}' from your account?`)) {
            dispatch(unlinkUserFromGameboard({boardId: board.id, boardTitle: board.title}));
        }
    }

    const boardSubjects = determineGameboardSubjects(board);
    const boardStages = allPropertiesFromAGameboard(board, "stage", stagesOrdered);
    const boardDifficulties = allPropertiesFromAGameboard(board, "difficulty", difficultiesOrdered);

    return boardView == BoardViews.table ?
        <tr className="board-card" data-testid={"my-gameboard-table-row"}>
            <td>
                <div className="board-subject-hexagon-container table-view">
                    {(board.percentageCompleted == 100) ? <span className="board-subject-hexagon subject-complete"/> :
                        <>
                            {generateGameboardSubjectHexagons(boardSubjects)}
                            <div className="board-percent-completed">{board.percentageCompleted}</div>
                        </>
                    }
                </div>
            </td>
            <td className="align-middle"><a href={boardLink}>{board.title}</a></td>
            <td className="text-center align-middle">{boardStages.map(s => stageLabelMap[s]).join(', ')}</td>
            <td className="text-center align-middle">
                {boardDifficulties.length > 0 && <AggregateDifficultyIcons stacked difficulties={boardDifficulties} />}
            </td>
            <td className="text-center align-middle">{formatBoardOwner(user, board)}</td>
            <td className="text-center align-middle">{formatDate(board.creationDate)}</td>
            <td className="text-center align-middle">{formatDate(board.lastVisited)}</td>
            <td className="text-center align-middle">
                <div className="table-share-link">
                    <ShareLink linkUrl={boardLink} gameboardId={board.id} />
                </div>
            </td>
            <td>
                <CustomInput id={`board-delete-${board.id}`} type="checkbox"
                             checked={board && (selectedBoards.some(e => e.id === board.id))}
                             onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                 board && updateBoardSelection(board, event.target.checked)
                             }} aria-label="Delete gameboard"/>
            </td>
        </tr>
        :
        <Card className="board-card card-neat" data-testid={"my-gameboard-card"}>
            <CardBody className="pb-4 pt-4">
                <button className="close" onClick={confirmCardDeleteBoard} aria-label="Delete gameboard">×</button>
                <div className="board-subject-hexagon-container">
                    {(board.percentageCompleted == 100) ? <span className="board-subject-hexagon subject-complete"/> :
                        <>
                            {generateGameboardSubjectHexagons(boardSubjects)}
                            <div className="board-percent-completed">{board.percentageCompleted}</div>
                        </>
                    }
                </div>
                <aside>
                    <CardSubtitle>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                    <CardSubtitle>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
                    <CardSubtitle>
                        {`Stage${boardStages.length !== 1 ? "s" : ""}: `}<strong>{boardStages.map(s => stageLabelMap[s]).join(', ') || "N/A"}</strong>
                    </CardSubtitle>
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

                <Row className="mt-1 mb-2">
                    <Col>
                        <CardTitle><Link to={boardLink}>{board.title}</Link></CardTitle>
                        <CardSubtitle>By: <strong>{formatBoardOwner(user, board)}</strong></CardSubtitle>
                    </Col>
                    <Col className="card-share-link col-auto">
                        <ShareLink linkUrl={boardLink} gameboardId={board.id} reducedWidthLink clickAwayClose />
                    </Col>
                </Row>
            </CardBody>
        </Card>;
};

export const MyGameboards = ({user}: {user: RegisteredUserDTO}) => {
    //Redux state and dispatch
    const dispatch = useAppDispatch();

    const [selectedBoards, setSelectedBoards] = useState<GameboardDTO[]>([]);
    const [boardCreator, setBoardCreator] = useState<BoardCreators>(BoardCreators.all);
    const [boardCompletion, setBoardCompletion] = useState<BoardCompletions>(BoardCompletions.any);
    const [completed, setCompleted] = useState(0);
    const [inProgress, setInProgress] = useState(0);
    const [notStarted, setNotStarted] = useState(0);

    const {
        boards, loading, viewMore,
        boardOrder, setBoardOrder,
        boardView, setBoardView,
        boardLimit, setBoardLimit,
        boardTitleFilter, setBoardTitleFilter
    } = useGameboards(
        isMobile() ? BoardViews.card : BoardViews.table,
        isMobile() ? BoardLimit.six : BoardLimit.All
        );

    function confirmDeleteMultipleBoards() {
        if (confirm(`Are you sure you want to remove ${selectedBoards && selectedBoards.length > 1 ? selectedBoards.length + " boards" : selectedBoards[0].title} from your account?`)) {
            selectedBoards && selectedBoards.map(board => dispatch(unlinkUserFromGameboard({boardId: board.id, boardTitle: board.title})));
            setSelectedBoards([]);
        }
    }

    const switchViewAndClearSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedBoards([]);
        setBoardView(e.target.value as BoardViews);
    }, [setBoardView, setSelectedBoards]);

    useEffect( () => {
        if (boards) {
            let boardsCompleted = 0;
            let boardsNotStarted = 0;
            let boardsInProgress = 0;
            boards.boards.map(board => {
                if (board.percentageCompleted === 0) {
                    boardsNotStarted += 1;
                } else if (board.percentageCompleted === 100) {
                    boardsCompleted += 1;
                } else {
                    boardsInProgress += 1;
                }
            });
            setCompleted(boardsCompleted);
            setInProgress(boardsInProgress);
            setNotStarted(boardsNotStarted);
        }
    }, [boards]);

    const pageHelp = <span>
        A summary of your gameboards
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="My gameboards" help={pageHelp} />
        {boards && boards.totalResults == 0 ?
            <>
                <h3 className="text-center mt-4">You have no gameboards to view.</h3>
                {isPhy && <div className="text-center mt-3 mb-5">
                    <Button color="secondary" tag={Link} to="/gameboards/new">Create a gameboard</Button>
                </div>}
            </>
            :
            <>
                <div className="mt-4 mb-2">
                    {boards && boards.totalResults && boards.totalResults > 0 && <h4>You have completed <strong>{completed}</strong> of <strong>{boards.totalResults}</strong> gameboard{boards.totalResults > 1 && "s"},
                        with <strong>{inProgress}</strong> on the go and <strong>{notStarted}</strong> not started</h4>}
                    {!boards && <h4>You have <IsaacSpinner size="sm" inline /> saved gameboards...</h4>}
                </div>
                <div>
                    {boardView !== BoardViews.table && <Row>
                        <Col sm={6} lg={3} xl={2}>
                            <Label className="w-100">
                                Display in <Input type="select" value={boardView} onChange={switchViewAndClearSelected}>
                                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                                </Input>
                            </Label>
                        </Col>
                        <div className="d-lg-none w-100" />
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
                    </Row>}
                </div>
                <ShowLoading until={boards}>
                    {boards && boards.boards &&
                        (boardView == BoardViews.card ?
                            // Card view
                            <>
                                <Row className={"row-cols-lg-3 row-cols-md-2 row-cols-1"}>
                                    {boards.boards.map(board => <Col key={board.id}>
                                        <Board
                                            board={board}
                                            selectedBoards={selectedBoards}
                                            setSelectedBoards={setSelectedBoards}
                                            boardView={boardView}
                                            user={user}
                                            boards={boards}
                                        />
                                    </Col>)}
                                </Row>
                                <div className="text-center mt-3 mb-5" style={{clear: "both"}}>
                                    <p>Showing <strong>{boards.boards.length}</strong> of <strong>{boards.totalResults}</strong></p>
                                    {boards.boards.length < boards.totalResults && <Button onClick={viewMore} disabled={loading}>{loading ? <Spinner /> : "View more"}</Button>}
                                </div>
                            </>
                            :
                            // Table view
                            <>
                                <Row>
                                    <Col sm={6} lg={3} xl={2}>
                                        <Label className="w-100">
                                            Display in <Input type="select" value={boardView} onChange={switchViewAndClearSelected} className="p-2">
                                                {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                                            </Input>
                                        </Label>
                                    </Col>
                                </Row>
                                <Card className="mt-2 mb-5">
                                    <CardBody id="boards-table">
                                        <Row>
                                            <Col lg={4}>
                                                <Label className="w-100">
                                                    Filter boards <Input type="text" onChange={(e) => setBoardTitleFilter(e.target.value)} placeholder="Filter boards by name"/>
                                                </Label>
                                            </Col>
                                            {/* TODO MT add stage selector */}
                                            {/*{SITE_SUBJECT == SITE.PHY && <Col sm={6} lg={{size: 3, offset: 1}}>*/}
                                            {/*    <Label className="w-100">Levels*/}
                                            {/*        <Select inputId="levels-select"*/}
                                            {/*            isMulti*/}
                                            {/*            options={[*/}
                                            {/*                {value: '1', label: '1'},*/}
                                            {/*                {value: '2', label: '2'},*/}
                                            {/*                {value: '3', label: '3'},*/}
                                            {/*                {value: '4', label: '4'},*/}
                                            {/*                {value: '5', label: '5'},*/}
                                            {/*                {value: '6', label: '6'},*/}
                                            {/*            ]}*/}
                                            {/*            className="basic-multi-select"*/}
                                            {/*            classNamePrefix="select"*/}
                                            {/*            placeholder="None"*/}
                                            {/*            onChange={multiSelectOnChange(setLevels)}*/}
                                            {/*        />*/}
                                            {/*    </Label>*/}
                                            {/*</Col>*/}
                                            {/*}*/}
                                            <Col sm={6} lg={{size: 2, offset: 4}}>
                                                <Label className="w-100">
                                                    Creator <Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                                                        {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
                                                    </Input>
                                                </Label>
                                            </Col>
                                            <Col sm={6} lg={2}>
                                                <Label className="w-100">
                                                    Completion <Input type="select" value={boardCompletion} onChange={e => setBoardCompletion(e.target.value as BoardCompletions)}>
                                                        {Object.values(BoardCompletions).map(completion => <option key={completion} value={completion}>{completion}</option>)}
                                                    </Input>
                                                </Label>
                                            </Col>
                                        </Row>

                                        <div className="overflow-auto mt-3">
                                            <Table className="mb-0">
                                                <thead>
                                                    <tr>
                                                        <th className="align-middle pointer-cursor">
                                                            <button className="table-button" onClick={() => boardOrder == BoardOrder.completion ? setBoardOrder(BoardOrder["-completion"]) : setBoardOrder(BoardOrder.completion)}>
                                                                Completion {boardOrder == BoardOrder.completion ? sortIcon.ascending : boardOrder == BoardOrder["-completion"] ? sortIcon.descending : sortIcon.sortable}
                                                            </button>
                                                        </th>
                                                        <th className="align-middle pointer-cursor">
                                                            <button className="table-button" onClick={() => boardOrder == BoardOrder.title ? setBoardOrder(BoardOrder["-title"]) : setBoardOrder(BoardOrder.title)}>
                                                                Board name {boardOrder == BoardOrder.title ? sortIcon.ascending : boardOrder == BoardOrder["-title"] ? sortIcon.descending : sortIcon.sortable}
                                                            </button>
                                                        </th>
                                                        <th className="text-center align-middle">Stages</th>
                                                        <th className="text-center align-middle" style={{whiteSpace: "nowrap"}}>
                                                            Difficulties <span id={`difficulties-help`} className="icon-help mx-1" />
                                                            <RS.UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                                                                Practice: {difficultiesOrdered.slice(0, siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}<br />
                                                                Challenge: {difficultiesOrdered.slice(siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}
                                                            </RS.UncontrolledTooltip>
                                                        </th>
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
                                                        <th colSpan={2}>
                                                            <div className="text-right align-middle">
                                                                <Button disabled={selectedBoards.length == 0} className="btn-sm" onClick={confirmDeleteMultipleBoards}>
                                                                    {`Delete (${selectedBoards.length})`}
                                                                </Button>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {boards.boards
                                                        .filter(board => board.title && board.title.toLowerCase().includes(boardTitleFilter.toLowerCase())
                                                        && (formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
                                                        && (boardCompletionSelection(board, boardCompletion)))
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
                            </>
                        )}
                </ShowLoading>
            </>}
    </Container>;
};
