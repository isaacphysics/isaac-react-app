import React from "react";
import { Card, CardBody, Button, Row, Col, Table, UncontrolledTooltip, Spinner } from "reactstrap";
import { BoardOrder, Boards } from "../../../IsaacAppTypes";
import { isPhy, siteSpecific, difficultiesOrdered, difficultyShortLabelMap, isAda, BoardViews, BoardCreators, BoardCompletions, matchesAllWordsInAnyOrder, formatBoardOwner, boardCompletionSelection } from "../../services";
import { SortItemHeader } from "./SortableItemHeader";
import { BoardCard } from "./cards/BoardCard";
import { RegisteredUserDTO, GameboardDTO } from "../../../IsaacApiTypes";
import classNames from "classnames";

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
    boardOrder: BoardOrder;
    setBoardOrder: (boardOrder: BoardOrder) => void;
}

export interface GameboardsCardsProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
    selectedBoards: GameboardDTO[];
    setSelectedBoards: (selectedBoards: GameboardDTO[]) => void;
    boardView: BoardViews;
    loading: boolean;
    viewMore: () => void;
}

const PhyTable = (props: GameboardsTableProps) => {
    return <Card className="mb-5 mt-3">
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

    const tableHeader = <tr className="my-gameboard-table-header">
        <SortItemHeader colSpan={isPhy ? 1 : 4} className={siteSpecific("", "w-100")} defaultOrder={BoardOrder.title} reverseOrder={BoardOrder["-title"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">
            {siteSpecific("Board name", "Quiz name")}
        </SortItemHeader>
        <th colSpan={2} className={classNames("long-titled-col", {"align-middle" : isPhy})}>
            Stages and Difficulties <span id={`difficulties-help`} className="icon-help mx-1" />
            <UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                Practice: {difficultiesOrdered.slice(0, siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}<br />
                Challenge: {difficultiesOrdered.slice(siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ")}
            </UncontrolledTooltip>
        </th>
        {isAda && <th>Creator</th>}
        <SortItemHeader defaultOrder={BoardOrder.created} reverseOrder={BoardOrder["-created"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            Created
        </SortItemHeader>
        <SortItemHeader defaultOrder={BoardOrder.attempted} reverseOrder={BoardOrder["-attempted"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            Attempted
        </SortItemHeader>
        <SortItemHeader defaultOrder={BoardOrder.correct} reverseOrder={BoardOrder["-correct"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
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

    return <div className={siteSpecific("", "mb-5 mb-md-6")}>
        <Table className="my-gameboard-table" responsive>
            <thead>
                {tableHeader}
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
};

const Cards = (props: GameboardsCardsProps) => {
    const {
        user, boards, selectedBoards, setSelectedBoards, boardView, loading, viewMore
    } = props;

    return boards && boards.boards && <>
        {<Row className={"row-cols-lg-3 row-cols-md-2 row-cols-1"}>
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
        </Row>}
        <div className="text-center mt-3 mb-5" style={{clear: "both"}}>
            <p>Showing <strong>{boards.boards.length}</strong> of <strong>{boards.totalResults}</strong></p>
            {boards.boards.length < boards.totalResults && <Button onClick={viewMore} disabled={loading}>{loading ? <Spinner /> : "View more"}</Button>}
        </div>
    </>;
};

export const GameboardsCards = Cards;
export const GameboardsTable = siteSpecific(PhyTable, CSTable);