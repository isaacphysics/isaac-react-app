import React, {useCallback, useEffect, useState} from "react";
import {selectors, unlinkUserFromGameboard, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import * as RS from 'reactstrap';
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
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
    difficultiesOrdered,
    difficultyShortLabelMap,
    formatBoardOwner,
    isAda,
    isMobile,
    isPhy, isTutorOrAbove, matchesAllWordsInAnyOrder, PATHS,
    siteSpecific,
    sortIcon,
    useGameboards
} from "../../services";
import {Link} from "react-router-dom";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import classNames from "classnames";
import {BoardCard} from "../elements/cards/BoardCard";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";

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
                            Filter boards <Input type="text" data-testid="title-filter" onChange={(e) => setBoardTitleFilter(e.target.value)} placeholder="Filter boards by name"/>
                        </Label>
                    </Col>
                    {/* TODO MT add stage selector */}
                    {/*{SITE_SUBJECT == SITE.PHY && <Col sm={6} lg={{size: 3, offset: 1}}>*/}
                    {/*    <Label className="w-100">Levels*/}
                    {/*        <StyledSelect inputId="levels-select"*/}
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
                                    <Button disabled={selectedBoards.length == 0} size="sm" color="link" onClick={confirmDeleteMultipleBoards}>
                                        {`Delete (${selectedBoards.length})`}
                                    </Button>
                                </div>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {boards?.boards
                            .filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter))
                            .filter(board => formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
                            .filter(board => boardCompletionSelection(board, boardCompletion))
                            .map(board =>
                                <BoardCard
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
                    <span className={"text-nowrap"}>Filter boards by name</span><Input type="text" data-testid="title-filter" onChange={(e) => setBoardTitleFilter(e.target.value)} />
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
                <th colSpan={4} className="w-100">
                    <button className="table-button" onClick={() => boardOrder == BoardOrder.title ? setBoardOrder(BoardOrder["-title"]) : setBoardOrder(BoardOrder.title)}>
                        Quiz name {boardOrder == BoardOrder.title ? sortIcon.ascending : boardOrder == BoardOrder["-title"] ? sortIcon.descending : sortIcon.sortable}
                    </button>
                </th>
                <th colSpan={2} className="long-titled-col">
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
                        ? <Button size={"sm"} color={"link"} onClick={confirmDeleteMultipleBoards}>
                            Delete ({selectedBoards.length})
                        </Button>
                        : "Delete"
                    }
                </th>
            </tr>
            </thead>
            <tbody>
            {boards?.boards
                .filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter))
                .filter(board => formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
                .filter(board => boardCompletionSelection(board, boardCompletion))
                .map(board =>
                    <BoardCard
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

    return <Container> {/* fluid={siteSpecific(false, true)} className={classNames({"px-lg-5 px-xl-6": isAda})} */}
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("My gameboards", "My quizzes")} help={pageHelp} />
        <PageFragment fragmentId={`${siteSpecific("gameboards", "quizzes")}_help_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={RenderNothing} />
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
                                        <BoardCard
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
