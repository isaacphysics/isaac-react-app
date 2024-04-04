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
    BoardLimit,
    BoardViews,
    difficultiesOrdered,
    difficultyShortLabelMap,
    isMobile,
    isPhy, isTutorOrAbove, matchesAllWordsInAnyOrder, PATHS,
    siteSpecific,
    useGameboards,
    isAda
} from "../../services";
import {Link} from "react-router-dom";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {BoardCard} from "../elements/cards/BoardCard";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import { Spacer } from "../elements/Spacer";
import { SortItemHeader }  from "../elements/SortableItemHeader";
import classNames from "classnames";

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
    boardCompletion: BoardCompletions;
    setBoardCompletion: (boardCompletion: BoardCompletions) => void;
    boardOrder: BoardOrder;
    setBoardOrder: (boardOrder: BoardOrder) => void;
}
const PhyTable = (props: GameboardsTableProps) => {
    return <Card>
        <CardBody id="boards-table">
            <CSTable {...props} />
        </CardBody>
    </Card>;
};

const CSTable = (props: GameboardsTableProps) => {
    const {
        user,
        boards, selectedBoards, setSelectedBoards, confirmDeleteMultipleBoards,
        boardView, switchViewAndClearSelected, boardTitleFilter, setBoardTitleFilter,
        boardCompletion, setBoardCompletion, boardOrder, setBoardOrder
    } = props;

    const tableHeader = <tr className="my-gameboard-table-header">
        <SortItemHeader defaultOrder={BoardOrder.completion} reverseOrder={BoardOrder["-completion"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            Completion
        </SortItemHeader>
        <SortItemHeader colSpan={isPhy ? 1 : 4} className={siteSpecific("", "w-100")} defaultOrder={BoardOrder.title} reverseOrder={BoardOrder["-title"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">
            {siteSpecific("Board name", "Quiz name")}
        </SortItemHeader>
        <th colSpan={2} className={classNames("long-titled-col", {"align-middle" : isPhy})}>
            Stages and Difficulties <span id={`difficulties-help`} className="icon-help mx-1" />
            <RS.UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                Practice: {difficultiesOrdered.slice(0, siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}<br />
                Challenge: {difficultiesOrdered.slice(siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}
            </RS.UncontrolledTooltip>
        </th>
        <SortItemHeader defaultOrder={BoardOrder.created} reverseOrder={BoardOrder["-created"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            Created
        </SortItemHeader>
        <SortItemHeader defaultOrder={BoardOrder.visited} reverseOrder={BoardOrder["-visited"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            Last viewed
        </SortItemHeader>
        {siteSpecific(
            <>
                <th className="text-center align-middle">Delete</th>
            </>,
            <>
                <th>Share</th>
                <th>
                    {selectedBoards.length
                        ? <Button size={"sm"} color={"link"} onClick={confirmDeleteMultipleBoards}>
                            Delete ({selectedBoards.length})
                        </Button>
                        : "Delete"
                    }
                </th>
            </>
        )}
    </tr>;

    return <div className={"mb-5 mb-md-6 mt-4"}>
        <Row>
            <Col xs={6} md={3}>
                <Label className="w-100">
                    Display in <Input type="select" value={boardView} onChange={switchViewAndClearSelected}>
                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                </Input>
                </Label>
            </Col>
            <Col xs={6} md={{size: 4, offset: 2}}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter boards by name</span><Input type="text" data-testid="title-filter" onChange={(e) => setBoardTitleFilter(e.target.value)} />
                </Label>
            </Col>
            <Col xs={6} md={3}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by Completion</span><Input type="select" value={boardCompletion} onChange={e => setBoardCompletion(e.target.value as BoardCompletions)}>
                        {Object.values(BoardCompletions).map(completion => <option key={completion} value={completion}>{completion}</option>)}
                    </Input>
                </Label>
            </Col>
        </Row>
        <Table className="mt-3 my-gameboard-table" responsive>
            <thead>
                {tableHeader}
            </thead>
            <tbody>
            {boards?.boards
                .filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter))
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
};

const GameboardsTable = siteSpecific(PhyTable, CSTable);

export const MyGameboards = () => {
    //Redux state and dispatch
    const dispatch = useAppDispatch();
    // We know the user is logged in to visit this page
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;

    const [selectedBoards, setSelectedBoards] = useState<GameboardDTO[]>([]);
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
        boardCompletion, setBoardCompletion, boardOrder, setBoardOrder
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
                        <Col xs={6} md={3}>
                            <Label className="w-100">
                                Display in <Input type="select" value={boardView} onChange={switchViewAndClearSelected}>
                                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                                </Input>
                            </Label>
                        </Col>
                        <Spacer />
                        <Col xs={6} md={{size: 2, offset: 3}}>
                            <Label className="w-100">
                                Show <Input type="select" value={boardLimit} onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                                    {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                                </Input>
                            </Label>
                        </Col>
                        <Col xs={6} md={4}>
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
