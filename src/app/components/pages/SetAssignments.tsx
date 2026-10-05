import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Button,
    Card,
    CardBody,
    Col,
    Input,
    Label,
    Row,
    Spinner,
    Table,
    UncontrolledTooltip
} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {
    openIsaacBooksModal,
    selectors,
    setAssignBoardPath,
    useAppDispatch,
    useAppSelector,
    useGetGroupsQuery} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    above,
    BOARD_ORDER_NAMES,
    BoardCreators,
    BoardLimit,
    BoardSubjects,
    BoardViews,
    determineGameboardSubjects,
    difficultiesOrdered,
    difficultyShortLabelMap,
    formatBoardOwner,
    isAda,
    isDefined,
    isPhy,
    matchesAllWordsInAnyOrder,
    PATHS,
    siteSpecific,
    useDeviceSize,
    useGameboards,
} from "../../services";
import {AssignmentDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {BoardAssignee, AssignmentBoardOrder, Boards} from "../../../IsaacAppTypes";
import {BoardCard} from "../elements/cards/BoardCard";
import {RenderNothing} from "../elements/RenderNothing";
import {SortItemHeader} from "../elements/SortableItemHeader";
import {HorizontalScroller} from "../elements/inputs/HorizontalScroller";
import classNames from "classnames";
import {PromptBanner} from "../elements/cards/PromptBanner";
import { PageMetadata } from "../elements/PageMetadata";
import { PageFragment } from "../elements/PageFragment";
import { useHistoryState } from "../../services/history";
import { PageContainer } from "../elements/layout/PageContainer";
import { MyAdaSidebar } from "../elements/sidebar/MyAdaSidebar";
import { SetAssignmentsSidebar } from "../elements/sidebar/SetAssignmentsSidebar";
import { Trans, useTranslation } from "react-i18next";

interface SetAssignmentsTableProps {
    user: RegisteredUserDTO;
    boards: Boards | null;
    boardView: BoardViews;
    switchView: (e: React.ChangeEvent<HTMLInputElement>) => void;
    boardSubject: BoardSubjects;
    setBoardSubject: (boardSubject: BoardSubjects) => void;
    boardTitleFilter: string;
    setBoardTitleFilter: (title: string) => void;
    boardCreator: BoardCreators;
    setBoardCreator: (creator: BoardCreators) => void;
    boardOrder: AssignmentBoardOrder;
    setBoardOrder: (boardOrder: AssignmentBoardOrder) => void;
}

const PhyTable = (props: SetAssignmentsTableProps) => {
    const { t } = useTranslation();
    const {
        user, boards, boardSubject,
        boardView, boardTitleFilter, boardCreator,
        boardOrder, setBoardOrder,
    } = props;

    const filteredBoards = useMemo(() => {
        return boards?.boards
            .filter(board => (matchesAllWordsInAnyOrder(board.title, boardTitleFilter) || board.id === boardTitleFilter))
            .filter(board => formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
            .filter(board => boardSubject == "All" || (determineGameboardSubjects(board).includes(boardSubject.toLowerCase())));
    }, [boards, boardTitleFilter, boardCreator, boardSubject, user]);

    const tableHeader = <tr>
        <th className="text-center align-middle"><span className="ps-2 pe-2">{t("common:assignments.table.groups")}</span></th>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.title}
            reverseOrder={AssignmentBoardOrder["-title"]} currentOrder={boardOrder}
            setOrder={setBoardOrder} alignment="start">
            {t("common:assignments.table.deckName")}
        </SortItemHeader>
        <th colSpan={2} className="text-center align-middle">
            <div className="d-flex align-items-center">
                {t("common:assignments.table.stagesAndDifficulties")}
                <i id="difficulties-help" className="icon icon-info icon-color-grey ms-2 position-relative"/>
            </div>
            <UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                <Trans i18nKey="common:assignments.table.difficultiesTooltip" components={{ br: <br /> }} values={{ practiceLevels: difficultiesOrdered.slice(0, 2).map(d => difficultyShortLabelMap[d]).join(", "), challengeLevels: difficultiesOrdered.slice(2).map(d => difficultyShortLabelMap[d]).join(", ") }} />
            </UncontrolledTooltip>
        </th>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.visited}
            reverseOrder={AssignmentBoardOrder["-visited"]} currentOrder={boardOrder}
            setOrder={setBoardOrder}>
            {t("common:assignments.table.lastViewed")}
        </SortItemHeader>
        <th className="text-center align-middle">{t("common:assignments.table.manage")}</th>
    </tr>;

    return <Card className="mt-2 mb-7">
        <CardBody id="boards-table">
            <HorizontalScroller enabled={filteredBoards ? filteredBoards.length > 6 : false}>
                <Table className="mb-0 my-gameboard-table">
                    <thead className="my-gameboard-table-header">
                        {tableHeader}
                    </thead>
                    <tbody>
                        {filteredBoards?.map(board =>
                            <BoardCard
                                key={board.id}
                                user={user}
                                board={board}
                                boardView={boardView}
                                displayAssignmentInfo={true}
                            />)
                        }
                    </tbody>
                </Table>
            </HorizontalScroller>
        </CardBody>
    </Card>;
};
const CSTable = (props: SetAssignmentsTableProps) => {
    const { t } = useTranslation();
    const {
        user,
        boards, boardView, switchView,
        boardTitleFilter, setBoardTitleFilter,
        boardCreator, setBoardCreator,
        boardOrder, setBoardOrder,
    } = props;

    const tableHeader = <tr>
        <th>{t("common:assignments.table.groups")}</th>
        <SortItemHeader<AssignmentBoardOrder> colSpan={2} defaultOrder={AssignmentBoardOrder.title}
            reverseOrder={AssignmentBoardOrder["-title"]} currentOrder={boardOrder}
            setOrder={setBoardOrder} alignment="start">
            {t("common:assignments.table.quizName")}
        </SortItemHeader>
        <th colSpan={2} className="long-titled-col">
            {t("common:assignments.table.stagesAndDifficulties")} <i id={`difficulties-help`} className="ms-1 icon icon-info icon-inline icon-color-black position-relative" />
            <UncontrolledTooltip placement="bottom" target={`difficulties-help`}>
                <Trans i18nKey="common:assignments.table.difficultiesTooltip" components={{ br: <br /> }} values={{ practiceLevels: difficultiesOrdered.slice(0, 2).map(d => difficultyShortLabelMap[d]).join(", "), challengeLevels: difficultiesOrdered.slice(2).map(d => difficultyShortLabelMap[d]).join(", ") }} />
            </UncontrolledTooltip>
        </th>
        <th>{t("common:assignments.table.creator")}</th>
        <SortItemHeader<AssignmentBoardOrder> defaultOrder={AssignmentBoardOrder.visited}
            reverseOrder={AssignmentBoardOrder["-visited"]} currentOrder={boardOrder}
            setOrder={setBoardOrder}>
            {t("common:assignments.table.lastViewed")}
        </SortItemHeader>
        <th>{t("common:assignments.table.manage")}</th>
        <th>{t("common:assignments.table.share")}</th>
        <th>{t("common:assignments.table.unsave")}</th>
    </tr>;

    return <div className={"mb-7 mt-4"}>
        <Row>
            <Col xs={6} md={4} lg={3} xl={3}>
                <Label className="w-100">
                    {t("common:assignments.filter.displayIn")} <Input type="select" value={boardView} onChange={switchView}>
                        {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                    </Input>
                </Label>
            </Col>
            <Col xs={{size: 12, order: 3}} md={{size: 4, offset: 1, order: 1}} lg={{size: 4, offset: 3}}
                xl={{size: 4, offset: 3}}>
                <Label className="w-100">
                    <span
                        className={"text-nowrap"}>{t("site:assignments.filter.byName")}</span><Input
                        type="text" onChange={(e) => setBoardTitleFilter(e.target.value)}/>
                </Label>
            </Col>
            <Col xs={6} md={{size: 3, order: 2}} lg={2} xl={2}>
                <Label className="w-100">
                    <span className={"text-nowrap"}>{t("common:assignments.filter.byCreator")}</span><Input type="select" value={boardCreator}
                        onChange={e => setBoardCreator(e.target.value as BoardCreators)}>
                        {Object.values(BoardCreators).map(creator => <option key={creator}
                            value={creator}>{creator}</option>)}
                    </Input>
                </Label>
            </Col>
        </Row>
        <HorizontalScroller enabled={boards ? boards.boards.length > 6 : false}>
            <Table className="mt-3 my-gameboard-table">
                <thead className="my-gameboard-table-header">
                    {tableHeader}
                </thead>
                <tbody>
                    {boards?.boards
                        .filter(board => matchesAllWordsInAnyOrder(board.title, boardTitleFilter)
                        && (formatBoardOwner(user, board) == boardCreator || boardCreator == "All"))
                        .map(board =>
                            <BoardCard
                                key={board.id}
                                user={user}
                                board={board}
                                boardView={boardView}
                                displayAssignmentInfo={true}
                            />)
                    }
                </tbody>
            </Table>
        </HorizontalScroller>
    </div>;
};
const SetAssignmentsTable = siteSpecific(PhyTable, CSTable);

const PhyAddGameboardButtonsSetAssignments = ({className, redirectBackTo}: { className?: string, redirectBackTo?: string }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    return <>
        <h4 className="mt-4 mb-3">
            {t("site:assignments.add.fromTitle")}
        </h4>
        <Row className={className}>
            <Col md={6} lg={4} className="pt-1">
                <Button role={"link"} onClick={() => {
                    setAssignBoardPath(redirectBackTo);
                    void dispatch(openIsaacBooksModal());
                }} color="keyline" block className="px-3">
                    {t("common:assignments.add.booksButton")}
                </Button>
            </Col>
            <Col md={6} lg={4} className="pt-1">
                <Button tag={Link} to={"/physics/a_level/question_decks"}
                    onClick={() => setAssignBoardPath(redirectBackTo)} color="keyline" block>
                    {t("common:assignments.add.topicDecksButton")}
                </Button>
            </Col>
            <Col md={12} lg={4} className="pt-1">
                <Button tag={Link} to={PATHS.GAMEBOARD_BUILDER} onClick={() => setAssignBoardPath(redirectBackTo)}
                    color="keyline" block>
                    {t("common:assignments.add.createDeckButton")}
                </Button>
            </Col>
        </Row>
    </>;
};

export const getAssigneesByBoard = (assignmentsSetByMe: AssignmentDTO[] | undefined): Record<string, BoardAssignee[]> => {
    return assignmentsSetByMe?.reduce((acc, assignment) => {
        if (!isDefined(assignment?.gameboardId) || !isDefined(assignment?.groupId)) return acc;
        const newAssignee = {
            groupId: assignment.groupId,
            groupName: assignment.groupName,
            startDate: assignment.scheduledStartDate
        };
        if (!(assignment.gameboardId in acc)) {
            return {...acc, [assignment.gameboardId]: [newAssignee]};
        }
        return {...acc, [assignment.gameboardId]: [...acc[assignment.gameboardId], newAssignee]};
    }, {} as { [gameboardId: string]: BoardAssignee[] }) ?? {};
};

export const SetAssignments = () => {
    const { t } = useTranslation();
    // We know the user is logged in and is at least a teacher in order to visit this page
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const {data: groups} = useGetGroupsQuery(false);

    const [boardCreator, setBoardCreator] = useHistoryState<BoardCreators>("boardCreator", BoardCreators.all);
    const [boardSubject, setBoardSubject] = useHistoryState<BoardSubjects>("boardSubject", BoardSubjects.all);

    const deviceSize = useDeviceSize();
    const {
        boards, loading, viewMore,
        boardOrder, setBoardOrder,
        boardView, setBoardView,
        boardLimit, setBoardLimit,
        boardTitleFilter, setBoardTitleFilter,
        haveAllBoards
    } = useGameboards(isAda && above["lg"](deviceSize) ? BoardViews.table : BoardViews.card);

    const isGroupsEmptyState = groups && groups.length === 0;
    const isBoardsEmptyState = boards && boards.boards?.length === 0;
    const switchView = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setBoardView(e.target.value as BoardViews);
    }, [setBoardView]);

    // Logic for set assignments modal.
    // hashAnchor acts as a buffer for a modal that needs to be opened. If it is set, the next time we get boards from
    // the API, a modal will be open with the gameboard specified by hashAnchor, **and then hashAnchor will be cleared**.

    // TODO this is made functional in a future commit! editing to appease ESLint for now
    const {hash} = useLocation();
    const [_hashAnchor, setHashAnchor] = useState<string | undefined>();
    useEffect(() => {
        setHashAnchor(hash.includes("#") ? hash.slice(1) : undefined);
    }, [hash]);

    const forceAllBoards = !!boardTitleFilter || boardCreator !== BoardCreators.all || boardSubject !== BoardSubjects.all;
    useEffect(() => {
        if (boardLimit !== BoardLimit.All && forceAllBoards) {
            setBoardLimit(BoardLimit.All);
        }
    }, [boardLimit, forceAllBoards, setBoardLimit]);

    useEffect(() => {
        // On Ada, reset filters when switching between display modes
        if (isAda) {
            setBoardTitleFilter("");
            setBoardCreator(BoardCreators.all);
            setBoardSubject(BoardSubjects.all);
        }
    }, [boardView, setBoardTitleFilter]);

    // TODO: this won't be used going forwards, but historic assignment links ought to still work – perhaps have a conditional component instead to prevent calling 
    // all the hooks required in useSetAssignment unnecessarily
    // useEffect(() => {
    //     if (boards && hashAnchor) {
    //         setHashAnchor(undefined);
    //         const board = boards.boards.find(b => b.id === hashAnchor);
    //         if (board) {
    //             openSetAssignmentModal(board);
    //         }
    //     }
    // }, [boards, hashAnchor, openSetAssignmentModal]);

    // Page help
    const pageHelp = <span>
        <Trans i18nKey="site:assignments.pageHelp" components={{ br: <br /> }} />
    </span>;

    const tableProps: SetAssignmentsTableProps = {
        user,
        boards, boardSubject, setBoardSubject,
        boardView, switchView, boardTitleFilter, setBoardTitleFilter,
        boardCreator, setBoardCreator, boardOrder, setBoardOrder
    };

    const filteredBoards = useMemo(() =>
        boards?.boards.filter(board => (matchesAllWordsInAnyOrder(board.title, boardTitleFilter) || board.id === boardTitleFilter))
            .filter(board => formatBoardOwner(user, board) == boardCreator || boardCreator == "All")
            .filter(board => boardSubject == "All" || (determineGameboardSubjects(board).includes(boardSubject.toLowerCase()))),
    [boards, user, boardTitleFilter, boardCreator, boardSubject]);

    const sortDisabled = !haveAllBoards;

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("site:assignments.title")}
                icon={{type: "icon", icon: "icon-question-deck"}} help={pageHelp}
            />
        }
        sidebar={siteSpecific(
            <SetAssignmentsSidebar
                displayMode={boardView} setDisplayMode={setBoardView}
                displayLimit={boardLimit} setDisplayLimit={setBoardLimit}
                boardTitleFilter={boardTitleFilter} setBoardTitleFilter={setBoardTitleFilter}
                sortOrder={boardOrder} setSortOrder={setBoardOrder}
                boardSubject={boardSubject} setBoardSubject={setBoardSubject}
                boardCreator={boardCreator} setBoardCreator={setBoardCreator}
                sortDisabled={sortDisabled} forceAllBoards={forceAllBoards}
                hideButton
            />,
            <MyAdaSidebar />
        )}
    >
        <PageMetadata showSidebarButton noTitle helpModalId="help_modal_set_assignments">
            <PageFragment fragmentId={siteSpecific("help_toptext_set_gameboards", "set_quizzes_help")} ifNotFound={RenderNothing} />
        </PageMetadata>
        {isPhy &&
            <>
                <PhyAddGameboardButtonsSetAssignments className={"mb-4"} redirectBackTo={PATHS.SET_ASSIGNMENTS}/>
                {isGroupsEmptyState && <Alert color="warning">
                    <Trans i18nKey="sci:assignments.emptyGroupsAlert" components={{ createGroupLink: <Link to="/groups" /> }} />
                </Alert>}
                {isBoardsEmptyState ?
                    <Alert color="warning">
                        {t("site:assignments.emptyBoardsAlert")}
                    </Alert>
                    :
                    <>
                        <h5>
                            <Trans i18nKey="sci:assignments.scheduleInfo" components={{ scheduleLink: <Link to={"/assignment_schedule"} /> }} />
                        </h5>
                        <div className="section-divider my-4"/>
                    </>
                }

            </>
        }
        {isAda && <>
            {isGroupsEmptyState &&
                <PromptBanner
                    card={{
                        title: t("ada:assignments.emptyGroupsTitle"),
                        icon: "icon-group",
                        bodyText: "",
                        color: "yellow",
                        buttons: {
                            primary: {
                                text: t("common:assignments.emptyGroupsButton"),
                                clickUrl: "/groups",
                                style: "outline"
                            }
                        }
                    }}
                />
            }
            <h3>{t("ada:assignments.yourQuizzes")}</h3>
            <div
                className={classNames("mb-4", "d-flex", "flex-column", "flex-lg-row", "align-items-center", {"justify-content-start": isBoardsEmptyState}, {"justify-content-between": !isBoardsEmptyState})}>
                {boards && boards.totalResults > 0 &&
                    <div>
                        <p className={"d-none d-lg-block my-auto"}>{`You have ${boards.boards.length} saved quiz${boards.boards.length > 1 ? "zes" : ""}.`}</p>
                    </div>
                }
                <div className={"w-100 w-lg-auto"}>
                    <Button className={"w-100 w-lg-auto"} tag={Link} to={PATHS.GAMEBOARD_BUILDER}
                        onClick={() => setAssignBoardPath(PATHS.SET_ASSIGNMENTS)} color="solid">
                        {t("ada:assignments.createQuizButton")}
                    </Button>
                    <Button className={"w-100 w-lg-auto mt-2 mt-lg-auto mx-auto mx-lg-2"} tag={Link}
                        to={"/pages/revision_quizzes"} color={"keyline"}>
                        {t("ada:assignments.viewPremadeQuizzes")}
                    </Button>
                </div>
            </div>
        </>}
        {!isBoardsEmptyState && <>
            {isAda && <>
                <Row>
                    {boardView === BoardViews.card && <Col sm={6} lg={3}>
                        <Label className="w-100">
                            {t("ada:assignments.filter.displayIn")} <Input type="select" value={boardView} onChange={switchView}>
                                {Object.values(BoardViews).map(view => <option key={view}
                                    value={view}>{view}</option>)}
                            </Input>
                        </Label>
                    </Col>}
                    {boardView === BoardViews.card && <>
                        <Col xs={6} lg={{size: 2, offset: 3}}>
                            <Label className="w-100">
                                {t("ada:assignments.filter.show")} <Input disabled={forceAllBoards} type="select" value={boardLimit}
                                    onChange={e => setBoardLimit(e.target.value as BoardLimit)}>
                                    {Object.values(BoardLimit).map(limit => <option key={limit}
                                        value={limit}>{limit}</option>)}
                                </Input>
                            </Label>
                        </Col>
                        <Col xs={6} lg={4}>
                            <Label className="w-100">
                                {t("ada:assignments.filter.sortBy")} 
                                <div className="d-flex gap-2 align-items-center">
                                    <Input type="select" value={boardOrder} disabled={sortDisabled}
                                        onChange={e => setBoardOrder(e.target.value as AssignmentBoardOrder)}
                                    >
                                        {Object.values(AssignmentBoardOrder).map(order => <option key={order} value={order}>
                                            {BOARD_ORDER_NAMES[order]}
                                        </option>)}
                                    </Input>
                                    {sortDisabled && <>
                                        <i id="sortHelpTooltip" className="icon icon-info icon-color-grey ms-2"/>
                                        <UncontrolledTooltip placement="auto" autohide target="sortHelpTooltip">
                                            {t("ada:assignments.filter.sortDisabledTooltip")}
                                        </UncontrolledTooltip>
                                    </>}
                                </div>
                            </Label>
                        </Col>
                    </>}
                </Row>
            </>}
            <ShowLoading until={boards}>
                {boards && boards.boards && <div>
                    {boardView == BoardViews.card ?
                        // Card view
                        <>
                            <Row
                                className={siteSpecific("row-cols-1", "row-cols-lg-3 row-cols-md-2 row-cols-1")}>
                                {filteredBoards?.map(board =>
                                    <Col key={board.id}>
                                        <BoardCard
                                            user={user}
                                            board={board}
                                            boardView={boardView}
                                            displayAssignmentInfo
                                        />
                                    </Col>)}
                            </Row>
                            <div className="text-center mt-3 mb-4" style={{clear: "both"}}>
                                <p><Trans i18nKey="common:assignments.pagination.showingCount" components={{ strongShown: <strong />, strongTotal: <strong /> }} values={{ shownCount: filteredBoards?.length, totalCount: boards.totalResults }} />
                                </p>
                                {boards.boards.length < boards.totalResults &&
                                    <Button onClick={viewMore} disabled={loading}>{loading ?
                                        <Spinner/> : t("common:assignments.pagination.viewMore")}</Button>}
                            </div>
                        </>
                        :
                        // Table view
                        <SetAssignmentsTable {...tableProps}/>}
                </div>}
            </ShowLoading>
        </>
        }
    </PageContainer>;
};
