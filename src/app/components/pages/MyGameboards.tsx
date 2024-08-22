import React, {useCallback, useEffect, useState} from "react";
import {selectors, unlinkUserFromGameboard, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {
    Button,
    Col,
    Container,
    Input,
    Label,
    Row} from 'reactstrap';
import {BoardOrder} from "../../../IsaacAppTypes";
import {GameboardDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    BOARD_ORDER_NAMES,
    BoardCompletions,
    BoardCreators,
    BoardLimit,
    BoardViews,
    isMobile,
    isPhy, isTutorOrAbove, PATHS,
    siteSpecific,
    useGameboards} from "../../services";
import {Link} from "react-router-dom";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import { GameboardsCards, GameboardsCardsProps, GameboardsTable, GameboardsTableProps } from "../elements/Gameboards";
import classNames from "classnames";

export interface GameboardsDisplaySettingsProps {
    boardView: BoardViews,
    switchViewAndClearSelected: (e: React.ChangeEvent<HTMLInputElement>) => void,
    boardLimit: BoardLimit,
    setBoardLimit: (limit: BoardLimit) => void,
    boardOrder: BoardOrder,
    setBoardOrder: (order: BoardOrder) => void,
    showFilters: boolean,
    setShowFilters: React.Dispatch<React.SetStateAction<boolean>>,
}

const GameboardsDisplaySettings = ({boardView, switchViewAndClearSelected, boardLimit, setBoardLimit, boardOrder, setBoardOrder, showFilters, setShowFilters}: GameboardsDisplaySettingsProps) => {
    return <Row>
        <Col xs={6} md={3}>
            <Label className="w-100">
                Display in <Input type="select" value={boardView} onChange={switchViewAndClearSelected}>
                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                </Input>
            </Label>
        </Col>
        <Col xs={6} md={2}>
            <Label className="w-100">
                Show <Input type="select" value={boardLimit} onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                    {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                </Input>
            </Label>
        </Col>
        <Col xs={9} md={5} lg={{size: 4, offset: 2}}>
            <Label className="w-100">
                Sort by <Input type="select" value={boardOrder} onChange={e => setBoardOrder(e.target.value as BoardOrder)}>
                    {Object.values(BoardOrder).map(order => <option key={order} value={order}>{BOARD_ORDER_NAMES[order]}</option>)}
                </Input>
            </Label>
        </Col>
        <Col xs={3} sm={{size: 2, offset: 1}} md={{size: 2, offset: 0}} lg={1}>
            <Label className="w-100 d-flex flex-column">
                Filters
                <Button color="secondary" className={classNames("gameboards-filter-dropdown", {"selected": showFilters})}
                onClick={() => setShowFilters(s => !s)} data-testid="filter-dropdown"/>
            </Label>
        </Col>
    </Row>;
};

interface GameboardsFiltersProps {
    boardCreator: BoardCreators,
    setBoardCreator: (creator: BoardCreators) => void,
    boardCompletion: BoardCompletions,
    setBoardCompletion: (boardCompletion: BoardCompletions) => void,
    setBoardTitleFilter: (title: string) => void,
    showFilters: boolean,
}

export const GameboardsFilters = ({boardCreator, setBoardCreator, boardCompletion, setBoardCompletion, setBoardTitleFilter, showFilters}: GameboardsFiltersProps) => {
    return <div>
        <Row className={classNames("my-gameboards-filters", {"shown": showFilters})}>
            <Col xs={12} lg={7}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter boards by name</span>
                    <Input type="text" data-testid="title-filter" onChange={(e) => setBoardTitleFilter(e.target.value)} />
                </Label>
            </Col>
            <Col xs={6} lg={2}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by Creator</span>
                    <Input type="select" value={boardCreator} onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                        {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
                    </Input>
                </Label>
            </Col>
            <Col xs={6} lg={3}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>Filter by Status</span>
                    <Input type="select" value={boardCompletion} onChange={e => setBoardCompletion(e.target.value as BoardCompletions)}>
                        {Object.values(BoardCompletions).map(completion => <option key={completion} value={completion}>{completion}</option>)}
                    </Input>
                </Label>
            </Col>
        </Row>
    </div>;
};

export const MyGameboards = () => {
    //Redux state and dispatch
    const dispatch = useAppDispatch();
    // We know the user is logged in to visit this page
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;

    const [selectedBoards, setSelectedBoards] = useState<GameboardDTO[]>([]);
    const [boardCreator, setBoardCreator] = useState<BoardCreators>(BoardCreators.all);
    const [boardCompletion, setBoardCompletion] = useState<BoardCompletions>(BoardCompletions.any);
    const [inProgress, setInProgress] = useState(0);
    const [notStarted, setNotStarted] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

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
            let boardsNotStarted = 0;
            let boardsInProgress = 0;
            boards.boards.map(board => {
                if (board.percentageAttempted === 0) {
                    boardsNotStarted += 1;
                } else {
                    boardsInProgress += 1;
                }
            });
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

    const cardProps: GameboardsCardsProps = {
        user, boards, selectedBoards, setSelectedBoards, boardView, boardTitleFilter, boardCreator, boardCompletion, loading, viewMore
    };

    return <Container> {/* fluid={siteSpecific(false, true)} className={classNames({"px-lg-5 px-xl-6": isAda})} */}
        <TitleAndBreadcrumb currentPageTitle={siteSpecific("My gameboards", "My quizzes")} help={pageHelp} />
        <PageFragment fragmentId={`${siteSpecific("gameboards", "quizzes")}_help_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={RenderNothing} />
        {boards && boards.totalResults == 0 ?
            <>
                <h3 className="text-center mt-4">You have no {siteSpecific("gameboards", "quizzes")} to view.</h3>
                {isPhy && <div className="text-center mt-3 mb-5">
                    <Button color="secondary" tag={Link} to={PATHS.GAMEBOARD_FILTER}>Create a gameboard</Button>
                </div>}
            </>
            :
            <>
                <div className="mt-4 mb-2">
                    {boards && <h4>Showing <strong>{inProgress + notStarted}</strong> gameboards, with <strong>{inProgress}</strong> on the go and <strong>{notStarted}</strong> not started</h4>}
                    {!boards && <IsaacSpinner size="sm" inline />}
                </div>
                <GameboardsDisplaySettings
                    boardView={boardView} switchViewAndClearSelected={switchViewAndClearSelected} boardLimit={boardLimit}
                    setBoardLimit={setBoardLimit} boardOrder={boardOrder} setBoardOrder={setBoardOrder}
                    showFilters={showFilters} setShowFilters={setShowFilters}
                />
                <GameboardsFilters boardCreator={boardCreator} setBoardCreator={setBoardCreator} boardCompletion={boardCompletion}
                    setBoardCompletion={setBoardCompletion} setBoardTitleFilter={setBoardTitleFilter} showFilters={showFilters}
                />
                <ShowLoading until={boards}>
                    {boards && boards.boards && <>
                        {(boardView === BoardViews.card
                            ? <GameboardsCards {...cardProps}/>
                            : <GameboardsTable {...tableProps}/>
                        )}
                    </>}
                </ShowLoading>
            </>}
    </Container>;
};
