import React from "react";
import { Card, CardBody, Button, Row, Col, Table, UncontrolledTooltip, Spinner } from "reactstrap";
import { AssignmentBoardOrder, Boards } from "../../../IsaacAppTypes";
import { isPhy, siteSpecific, difficultiesOrdered, difficultyShortLabelMap, isAda, BoardViews, BoardCreators, BoardCompletions, matchesAllWordsInAnyOrder, formatBoardOwner, boardCompletionSelection } from "../../services";
import { SortItemHeader } from "./SortableItemHeader";
import { BoardCard } from "./cards/BoardCard";
import { RegisteredUserDTO, GameboardDTO } from "../../../IsaacApiTypes";
import classNames from "classnames";
import { HorizontalScroller } from "./inputs/HorizontalScroller";

export interface GameboardsTableProps {
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
    boardOrder: AssignmentBoardOrder;
    setBoardOrder: (boardOrder: AssignmentBoardOrder) => void;
}

export interface GameboardsCardsProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
    selectedBoards: GameboardDTO[];
    setSelectedBoards: (selectedBoards: GameboardDTO[]) => void;
    boardTitleFilter: string;
    boardCreator: BoardCreators;
    boardCompletion: BoardCompletions;
    boardView: BoardViews;
    loading: boolean;
    viewMore: () => void;
}

const PhyTable = (props: GameboardsTableProps) => {
    return <Card className="mb-7 mt-3">
        <CardBody id="boards-table" className="px-3 py-2">
            <CSTable {...props} />
        </CardBody>
    </Card>;
};

const CSTable = (props: GameboardsTableProps) => {
    const {
        user,
        boards, selectedBoards, setSelectedBoards, confirmDeleteMultipleBoards,
        boardView, boardTitleFilter, boardCompletion, boardCreator, 
        boardOrder, setBoardOrder
    } = props;

    const tableHeader = <tr>
        <SortItemHeader<AssignmentBoardOrder> colSpan={isPhy ? 1 : 4} className={siteSpecific("", "w-100")} defaultOrder={AssignmentBoardOrder.title} reverseOrder={AssignmentBoardOrder["-title"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">
            {siteSpecific("Question deck name", "Quiz name")}
        </SortItemHeader>
        <th colSpan={2} className={classNames("long-titled-col", {"align-middle" : isPhy})}>
            Stages and Difficulties <i id={`difficulties-help`} className={classNames("icon icon-info icon-inline mx-1", siteSpecific("icon-color-grey", "icon-color-black"))} />
            <UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                Practice: {difficultiesOrdered.slice(0, siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}<br />
                Challenge: {difficultiesOrdered.slice(siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}
            </UncontrolledTooltip>
        </th>
        {isAda && <th>Creator</th>}
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.created} reverseOrder={AssignmentBoardOrder["-created"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            Created
        </SortItemHeader>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.attempted} reverseOrder={AssignmentBoardOrder["-attempted"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            Attempted
        </SortItemHeader>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.correct} reverseOrder={AssignmentBoardOrder["-correct"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            Correct
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

    const filteredBoards = boards && boards.boards
        .filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter) || board.id === boardTitleFilter)
        .filter(board => formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
        .filter(board => boardCompletionSelection(board, boardCompletion));

    return <div className={siteSpecific("", "mb-7")}>
        <HorizontalScroller enabled={filteredBoards ? filteredBoards.length > 6 : false}>
            <Table className={classNames("my-gameboard-table", {"mb-0" : isPhy})}>
                <thead className="my-gameboard-table-header">
                    {tableHeader}
                </thead>
                <tbody>
                    {filteredBoards && filteredBoards.map(board =>
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
        </HorizontalScroller>
    </div>;
};

const Cards = (props: GameboardsCardsProps) => {
    const {
        user, boards, selectedBoards, setSelectedBoards, boardView, 
        boardTitleFilter, boardCreator, boardCompletion, loading, viewMore
    } = props;

    const filteredBoards = boards && boards.boards && boards.boards
        .filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter) || board.id === boardTitleFilter)
        .filter(board => formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
        .filter(board => boardCompletionSelection(board, boardCompletion));

    return filteredBoards && <>
        {<Row className={siteSpecific("row-cols-1", "row-cols-lg-3 row-cols-md-2 row-cols-1")}>
            {filteredBoards.map(board => <Col key={board.id}>
                <BoardCard
                    board={board}
                    selectedBoards={selectedBoards}
                    setSelectedBoards={setSelectedBoards}
                    boardView={boardView}
                    user={user}
                    boards={boards}
                />
            </Col>)}
        </Row>}
        <div className="text-center mt-3 mb-7" style={{clear: "both"}}>
            {boards.boards.length === filteredBoards.length
                ? <p>Showing <strong>{boards.boards.length}</strong> of <strong>{boards.totalResults}</strong> results.</p>
                : <p>Showing <strong>{filteredBoards.length}</strong> match from <strong>{boards.boards.length}</strong> results.</p>}
            {boards.boards.length < boards.totalResults && <Button 
                onClick={viewMore} disabled={loading}
            >
                {loading ? <Spinner /> : boards.boards.length === filteredBoards.length ? "View more" : "Load more"}
            </Button>}
        </div>
    </>;
};

export const GameboardsCards = Cards;
export const GameboardsTable = siteSpecific(PhyTable, CSTable);
