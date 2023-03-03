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
    BOARD_ORDER_NAMES,
    BoardCompletions,
    boardCompletionSelection,
    BoardCreators,
    BoardLimit,
    BoardViews,
    determineGameboardStagesAndDifficulties,
    determineGameboardSubjects,
    difficultiesOrdered,
    difficultyShortLabelMap,
    formatBoardOwner,
    generateGameboardSubjectHexagons,
    isAda,
    isMobile,
    isPhy, PATHS,
    siteSpecific,
    sortIcon,
    stageLabelMap,
    useGameboards
} from "../../services";
import {formatDate} from "../elements/DateString";
import {ShareLink} from "../elements/ShareLink";
import {Link} from "react-router-dom";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import classNames from "classnames";
import {sortBy} from "lodash";
import {Util} from "leaflet";
import indexOf = Util.indexOf;
import {Circle} from "../elements/svg/Circle";
import {GameboardCard} from "../elements/GameboardCard";

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

    const boardLink = `${PATHS.GAMEBOARD}#${board.id}`;

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
    const boardStagesAndDifficulties = determineGameboardStagesAndDifficulties(board);

    const basicCellClasses = `align-middle ${siteSpecific("text-center", "text-left")}`;

    return boardView == BoardViews.table ?
        <tr className={siteSpecific("board-card", "")} data-testid={"my-gameboard-table-row"}>
            <td className={siteSpecific("", "align-middle text-center")}>
                {siteSpecific(
                    <div className="board-subject-hexagon-container table-view">
                        {(board.percentageCompleted === 100)
                            ? <span className="board-subject-hexagon subject-complete"/>
                            : <>
                                {generateGameboardSubjectHexagons(boardSubjects)}
                                <div className="board-percent-completed">{board.percentageCompleted}</div>
                            </>
                        }
                    </div>,
                    <svg width={48} height={48}>
                        <Circle radius={24} properties={{fill: "#000"}}/>
                        <foreignObject className="board-percent-completed" x={0} y={0} width={48} height={48}>
                            {board.percentageCompleted}%
                        </foreignObject>
                    </svg>
                )}
            </td>
            <td colSpan={siteSpecific(1, 4)} className="align-middle">
                <a href={boardLink} className={isAda ? "font-weight-semi-bold" : ""}>{board.title}</a>
            </td>
            <td className={basicCellClasses + " p-0"} colSpan={2}>
                {boardStagesAndDifficulties.length > 0 && <table className="w-100 border-0">
                    <tbody>
                        {boardStagesAndDifficulties.map(([stage,difficulties], i) => {
                            return <tr key={stage} className={classNames({"border-0": i === 0, "border-left-0 border-right-0 border-bottom-0": i === 1})}>
                                <td className="text-center align-middle border-0 p-1 w-50">
                                    {stageLabelMap[stage]}
                                </td>
                                <td className="text-center align-middle border-0 p-1 w-50">
                                    {isAda && "("}{sortBy(difficulties, d => indexOf(Object.keys(difficultyShortLabelMap), d)).map(d => difficultyShortLabelMap[d]).join(", ")}{isAda && ")"}
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>}
            </td>
            <td className={basicCellClasses}>{formatBoardOwner(user, board)}</td>
            <td className={basicCellClasses}>{formatDate(board.creationDate)}</td>
            <td className={basicCellClasses}>{formatDate(board.lastVisited)}</td>
            <td className={basicCellClasses}>
                <div className="table-share-link">
                    <ShareLink linkUrl={boardLink} gameboardId={board.id} outline={isAda} clickAwayClose={isAda} />
                </div>
            </td>
            <td>
                <CustomInput
                    id={`board-delete-${board.id}`} type="checkbox"
                    checked={board && (selectedBoards.some(e => e.id === board.id))}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        board && updateBoardSelection(board, event.target.checked)
                    }} aria-label="Delete gameboard"
                />
            </td>
        </tr>
        :
        siteSpecific(
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
                        <table className="w-100">
                            <thead>
                            <tr>
                                <th className="w-50 font-weight-light">
                                    {`Stage${boardStagesAndDifficulties.length > 1 ? "s" : ""}:`}
                                </th>
                                <th className="w-50 font-weight-light pl-1">
                                    {`Difficult${boardStagesAndDifficulties.some(([, ds]) => ds.length > 1) ? "ies" : "y"}`}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                                {boardStagesAndDifficulties.map(([stage, difficulties]) => <tr key={stage}>
                                    <td className="w-50 align-baseline text-lg-right">
                                        <strong>{stageLabelMap[stage]}:</strong>
                                    </td>
                                    <td className="w-50 pl-1">
                                        <strong>{difficulties.map((d) => difficultyShortLabelMap[d]).join(", ")}</strong>
                                    </td>
                                </tr>)}
                                {boardStagesAndDifficulties.length === 0 && <tr>
                                    <td className="w-50 align-baseline text-lg-right">
                                        <strong>N/A:</strong>
                                    </td>
                                    <td className="w-50 pl-1">
                                        <strong>-</strong>
                                    </td>
                                </tr>}
                            </tbody>
                        </table>
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
            </Card>,
            <GameboardCard user={user} board={board}/>
        );
};

interface GameboardsTableProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
    selectedBoards: GameboardDTO[];
    setSelectedBoards: (selectedBoards: GameboardDTO[]) => void;
    confirmDeleteMultipleBoards: () => void;
    boardView: BoardViews;
    switchViewAndClearSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
    boardTitleFilter: string;
    setBoardTitleFilter: (title: string) => void;
    boardCreator: BoardCreators;
    setBoardCreator: (creator: BoardCreators) => void;
    boardCompletion: BoardCompletions;
    setBoardCompletion: (boardCompletion: BoardCompletions) => void;
    boardOrder: BoardOrder;
    setBoardOrder: (boardOrder: BoardOrder) => void;
}
const PhyTable = (props: GameboardsTableProps) => {
    const {
        user,
        boards, selectedBoards, setSelectedBoards, confirmDeleteMultipleBoards,
        boardView, switchViewAndClearSelected, boardTitleFilter, setBoardTitleFilter,
        boardCompletion, setBoardCompletion, boardCreator, setBoardCreator,
        boardOrder, setBoardOrder
    } = props;
    return <>
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
                        {boards?.boards
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
    </>;
}

const CSTable = (props: GameboardsTableProps) => {
    const {
        user,
        boards, selectedBoards, setSelectedBoards, confirmDeleteMultipleBoards,
        boardView, switchViewAndClearSelected, boardTitleFilter, setBoardTitleFilter,
        boardCompletion, setBoardCompletion, boardCreator, setBoardCreator,
        boardOrder, setBoardOrder
    } = props;
    return <div className={"mb-5 mb-md-6 mt-4"}>
        <Row>
            <Col xs={6} md={3} xl={2}>
                <Label className="w-100">
                    Display in <Input type="select" value={boardView} onChange={switchViewAndClearSelected}>
                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                </Input>
                </Label>
            </Col>
            <Col xs={6} md={3} lg={4} xl={{size: 3, offset: 3}}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter boards by name</span><Input type="text" onChange={(e) => setBoardTitleFilter(e.target.value)} />
                </Label>
            </Col>
            <Col xs={6} md={3} lg={2} xl={2}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by Creator</span><Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                    {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
                </Input>
                </Label>
            </Col>
            <Col xs={6} md={3} xl={2}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by Completion</span><Input type="select" value={boardCompletion} onChange={e => setBoardCompletion(e.target.value as BoardCompletions)}>
                        {Object.values(BoardCompletions).map(completion => <option key={completion} value={completion}>{completion}</option>)}
                    </Input>
                </Label>
            </Col>
        </Row>
        <Table className="mt-3 my-gameboard-table" responsive>
            <thead>
            <tr>
                <th>
                    <button className="table-button" onClick={() => boardOrder == BoardOrder.completion ? setBoardOrder(BoardOrder["-completion"]) : setBoardOrder(BoardOrder.completion)}>
                        Completion {boardOrder == BoardOrder.completion ? sortIcon.ascending : boardOrder == BoardOrder["-completion"] ? sortIcon.descending : sortIcon.sortable}
                    </button>
                </th>
                <th colSpan={4}>
                    <button className="table-button" onClick={() => boardOrder == BoardOrder.title ? setBoardOrder(BoardOrder["-title"]) : setBoardOrder(BoardOrder.title)}>
                        Quiz name {boardOrder == BoardOrder.title ? sortIcon.ascending : boardOrder == BoardOrder["-title"] ? sortIcon.descending : sortIcon.sortable}
                    </button>
                </th>
                <th colSpan={2}>
                    Stages and Difficulties <span id={`difficulties-help`} className="icon-help mx-1" />
                    <RS.UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                        Practice: {difficultiesOrdered.slice(0, siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}<br />
                        Challenge: {difficultiesOrdered.slice(siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}
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
                <th>Share</th>
                <th>
                    {selectedBoards.length
                        ? <Button className="btn-sm btn-link" onClick={confirmDeleteMultipleBoards}>
                            Delete ({selectedBoards.length})
                        </Button>
                        : "Delete"
                    }
                </th>
            </tr>
            </thead>
            <tbody>
            {boards?.boards
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
    </div>;
}

const GameboardsTable = siteSpecific(PhyTable, CSTable);

export const MyGameboards = () => {
    //Redux state and dispatch
    const dispatch = useAppDispatch();
    // We know the user is logged in to visit this page
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;

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
        A summary of your {siteSpecific("gameboards", "quizzes")}
    </span>;

    const tableProps: GameboardsTableProps = {
        user,
        boards, selectedBoards, setSelectedBoards, confirmDeleteMultipleBoards,
        boardView, switchViewAndClearSelected, boardTitleFilter, setBoardTitleFilter,
        boardCompletion, setBoardCompletion, boardCreator, setBoardCreator,
        boardOrder, setBoardOrder
    };

    return <Container fluid={siteSpecific(false, true)} className={classNames({"px-lg-6": isAda})}>
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("My gameboards", "My quizzes")} help={pageHelp} />
        {boards && boards.totalResults == 0 ?
            <>
                <h3 className="text-center mt-4">You have no {siteSpecific("gameboards", "quizzes")} to view.</h3>
                {isPhy && <div className="text-center mt-3 mb-5">
                    <Button color="secondary" tag={Link} to={PATHS.QUESTION_FINDER}>Create a gameboard</Button>
                </div>}
            </>
            :
            <>
                <div className="mt-4 mb-2">
                    {boards && boards.totalResults && boards.totalResults > 0 && <h4>You have completed <strong>{completed}</strong> of <strong>{boards.totalResults}</strong> {siteSpecific("gameboard", "quiz")}{boards.totalResults > 1 && siteSpecific("s", "zes")},
                        with <strong>{inProgress}</strong> on the go and <strong>{notStarted}</strong> not started</h4>}
                    {!boards && <h4>You have <IsaacSpinner size="sm" inline /> saved {siteSpecific("gameboards", "quizzes")}...</h4>}
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
                            <GameboardsTable {...tableProps}/>
                        )}
                </ShowLoading>
            </>}
    </Container>;
};
