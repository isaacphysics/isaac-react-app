import React from "react";
import { Card, CardBody, Button, Row, Col, Table, UncontrolledTooltip, Spinner } from "reactstrap";
import { AssignmentBoardOrder, Boards } from "../../../IsaacAppTypes";
import { isPhy, siteSpecific, difficultiesOrdered, difficultyShortLabelMap, isAda, BoardViews, BoardCreators, BoardCompletions, matchesAllWordsInAnyOrder, formatBoardOwner, boardCompletionSelection } from "../../services";
import { SortItemHeader } from "./SortableItemHeader";
import { BoardCard } from "./cards/BoardCard";
import { RegisteredUserDTO, GameboardDTO } from "../../../IsaacApiTypes";
import classNames from "classnames";
import { HorizontalScroller } from "./inputs/HorizontalScroller";
import { Trans, useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const {
        user,
        boards, selectedBoards, setSelectedBoards, confirmDeleteMultipleBoards,
        boardView, boardTitleFilter, boardCompletion, boardCreator, 
        boardOrder, setBoardOrder
    } = props;

    const tableHeader = <tr>
        <SortItemHeader<AssignmentBoardOrder> colSpan={isPhy ? 1 : 4} className={siteSpecific("", "w-100")} defaultOrder={AssignmentBoardOrder.title} reverseOrder={AssignmentBoardOrder["-title"]} currentOrder={boardOrder} setOrder={setBoardOrder} alignment="start">
            {t("site:gameboard.table.nameHeader")}
        </SortItemHeader>
        <th colSpan={2} className={classNames("long-titled-col", {"align-middle" : isPhy})}>
            {t("common:gameboard.table.stagesHeader")} <i id={`difficulties-help`} className={classNames("icon icon-info icon-inline mx-1", siteSpecific("icon-color-grey position-relative", "icon-color-black"))} />
            <UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                <Trans
                    i18nKey="common:gameboard.table.difficultiesTooltip"
                    components={{
                        br: <br />,
                    }}
                    values={{ practiceLevels: difficultiesOrdered.slice(0, siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", "), challengeLevels: difficultiesOrdered.slice(siteSpecific(3, 2)).map(d => difficultyShortLabelMap[d]).join(", ") }}
                />
            </UncontrolledTooltip>
        </th>
        {isAda && <th>{t("common:gameboard.table.creatorHeader")}</th>}
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.created} reverseOrder={AssignmentBoardOrder["-created"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            {t("common:gameboard.table.createdHeader")}
        </SortItemHeader>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.attempted} reverseOrder={AssignmentBoardOrder["-attempted"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            {t("common:gameboard.table.attemptedHeader")}
        </SortItemHeader>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.correct} reverseOrder={AssignmentBoardOrder["-correct"]} currentOrder={boardOrder} setOrder={setBoardOrder}>
            {t("common:gameboard.table.correctHeader")}
        </SortItemHeader>
        {siteSpecific(
            <>
                <th className="text-center align-middle">
                    {boardView === BoardViews.card ? t("common:gameboard.table.unsaveButton") : t("common:gameboard.table.manageButton")}
                </th>
            </>,
            <>
                <th>{t("common:gameboard.table.shareHeader")}</th>
                <th>
                    {selectedBoards.length
                        ? <Button size={"sm"} color={"link"} onClick={confirmDeleteMultipleBoards}>
                            {t("common:gameboard.table.unsaveCountButton", { selectedCount: selectedBoards.length })}
                        </Button>
                        : "Unsave"
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
                            displayAssignmentInfo={false}
                        />)
                    }
                </tbody>
            </Table>
        </HorizontalScroller>
    </div>;
};

const Cards = (props: GameboardsCardsProps) => {
    const { t } = useTranslation();
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
                    displayAssignmentInfo={false}
                />
            </Col>)}
        </Row>}
        <div className="text-center mt-3 mb-7" style={{clear: "both"}}>
            {boards.boards.length === filteredBoards.length
                ? <p><Trans
                    i18nKey="common:gameboard.cards.showingAll"
                    components={{
                        loadedCountEmphasis: <strong />,
                        totalCountEmphasis: <strong />,
                    }}
                    values={{ loadedCount: boards.boards.length, totalCount: boards.totalResults }}
                /></p>
                : <p><Trans
                    i18nKey="common:gameboard.cards.showingFiltered"
                    components={{
                        matchedCountEmphasis: <strong />,
                        loadedCountEmphasis: <strong />,
                    }}
                    values={{ matchedCount: filteredBoards.length, loadedCount: boards.boards.length }}
                /></p>}
            {boards.boards.length < boards.totalResults && <Button 
                onClick={viewMore} disabled={loading}
            >
                {loading ? <Spinner /> : boards.boards.length === filteredBoards.length ? t("common:gameboard.cards.viewMoreButton") : t("common:gameboard.cards.loadMoreButton")}
            </Button>}
        </div>
    </>;
};

export const GameboardsCards = Cards;
export const GameboardsTable = siteSpecific(PhyTable, CSTable);
