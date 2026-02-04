import React, {useEffect} from "react";
import {
    logAction,
    selectors,
    setAssignBoardPath,
    useAppDispatch,
    useAppSelector,
    useGetGameboardByIdQuery,
    useGetMyAssignmentsQuery
} from "../../state";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    convertGameboardItemToContentSummary,
    getThemeFromTags,
    isAda,
    isDefined,
    isFound,
    isTeacherPending,
    isPhy,
    isTutorOrAbove,
    PATHS,
    SEARCH_RESULT_TYPE,
    showWildcard,
    siteSpecific
} from "../../services";
import {Navigate, useLocation} from "react-router";
import classNames from "classnames";
import {skipToken} from "@reduxjs/toolkit/query";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {MainContent, SidebarLayout} from "../elements/layout/SidebarLayout";
import {PageMetadata} from "../elements/PageMetadata";
import {ListView} from "../elements/list-groups/ListView";
import { GameboardSidebar } from "../elements/sidebar/GameboardSidebar";
import { SupersededDeprecatedBoardContentWarning } from "../navigation/SupersededDeprecatedWarning";

export const Gameboard = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const gameboardId = location.hash ? location.hash.slice(1) : null;
    const gameboardQuery = useGetGameboardByIdQuery(gameboardId || skipToken);
    const { data: gameboard } = gameboardQuery;
    const user = useAppSelector(selectors.user.orNull);
    const queryArg = user?.loggedIn && !isTeacherPending(user) ? undefined : skipToken;
    const {data: assignments} = useGetMyAssignmentsQuery(queryArg, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    const thisGameboardAssignments = isDefined(gameboardId) && isDefined(assignments) && isFound(assignments) && (assignments.filter(a => a.gameboardId?.includes(gameboardId)));
    const contentSummary: ContentSummaryDTO[] = gameboard?.contents?.map(q => { return {...convertGameboardItemToContentSummary(q), state: q.state}; }) || [];
    const wildCard: ContentSummaryDTO = {...gameboard?.wildCard, type: SEARCH_RESULT_TYPE.SHORTCUT, tags: [], className: "wildcard-list-view"} as ContentSummaryDTO;
    const displayQuestions = (gameboard?.wildCard && gameboard && showWildcard(gameboard)) ? [wildCard, ...contentSummary] : contentSummary;
    const questionThemes = gameboard?.contents?.map(q => getThemeFromTags(q.tags)).filter((v, i, a) => a.indexOf(v) === i);
    const singleSubject = questionThemes?.length === 1 ? questionThemes[0] : undefined;

    // Only log a gameboard view when we have a gameboard loaded:
    useEffect(() => {
        if (isDefined(gameboard) && isFound(gameboard)) {
            dispatch(logAction({type: "VIEW_GAMEBOARD_BY_ID", gameboardId: gameboard.id}));
        }
    }, [dispatch, gameboard]);

    const notFoundComponent = <>
        <TitleAndBreadcrumb
            breadcrumbTitleOverride={siteSpecific("Question deck", "Quiz")}
            currentPageTitle={`${siteSpecific("Question deck", "Quiz")} not found`}
            icon={{type: "icon", icon: "icon-error"}}
        />
        <h3 className="my-4">
            {`We're sorry, we were not able to find a ${siteSpecific("question deck", "quiz")} with the id `}<code>{gameboardId}</code>{"."}
        </h3>
    </>;
    return !gameboardId
        ? <Navigate to={PATHS.QUESTION_FINDER} />
        : <Container className="mb-7" data-bs-theme={singleSubject}>
            <ShowLoadingQuery
                query={gameboardQuery}
                defaultErrorTitle={`Error fetching ${siteSpecific("question deck", "quiz")} with id: ${gameboardId}`}
                ifNotFound={notFoundComponent}
                thenRender={(gameboard) => {
                    return <>
                        <TitleAndBreadcrumb
                            currentPageTitle={gameboard && gameboard.title || siteSpecific("Question deck", "Filter Generated Quiz")} icon={{type: "icon", icon: "icon-question-deck"}}
                            intermediateCrumbs={isPhy && thisGameboardAssignments && thisGameboardAssignments.length ? [{title: "Assignments", to: "/assignments"}] : []}
                        />
                        <SidebarLayout>
                            <GameboardSidebar gameboard={gameboard} assignments={thisGameboardAssignments} hideButton />
                            <MainContent>
                                <PageMetadata title={gameboard.title} showSidebarButton sidebarButtonText="Details"/>
                                <SupersededDeprecatedBoardContentWarning gameboard={gameboard} />
                                <ListView type="item" items={displayQuestions} linkedBoardId={gameboardId} className={classNames("mt-3", {"col col-lg-10 offset-lg-1": isAda})} hasCaret={isAda}/>
                                {user && isTutorOrAbove(user)
                                    ? <Row>
                                        <Col xs={{size: 10, offset: 1}} sm={{size: 8, offset: 2}} md={{size: 6, offset: 0}} lg={{size: 4, offset: 2}} xl={{size: 3, offset: 2}} className="mt-4">
                                            <Button tag={Link} to={`${PATHS.ADD_GAMEBOARD}/${gameboardId}`} color="keyline" block>
                                                {"Set as assignment"}
                                            </Button>
                                        </Col>
                                        <Col xs={{size: 10, offset: 1}} sm={{size: 8, offset: 2}} md={{size: 6, offset: 0}} lg={4} xl={{size: 3, offset: 2}} className="mt-4">
                                            <Button tag={Link} to={{pathname: PATHS.GAMEBOARD_BUILDER, search: `?base=${gameboardId}`}} color="keyline" block>
                                                {"Duplicate and edit"}
                                            </Button>
                                        </Col>
                                    </Row>
                                    : gameboard && !gameboard.savedToCurrentUser && <Row>
                                        <Col className="mt-4" sm={{size: 8, offset: 2}} md={{size: 4, offset: 4}}>
                                            <Button tag={Link} to={`${PATHS.ADD_GAMEBOARD}/${gameboardId}`}
                                                onClick={() => setAssignBoardPath(PATHS.SET_ASSIGNMENTS)}
                                                color="keyline" block
                                            >
                                                {siteSpecific("Save to My question decks", "Save to My quizzes")}
                                            </Button>
                                        </Col>
                                    </Row>
                                }
                            </MainContent>
                        </SidebarLayout>
                    </>;
                }}
            />
        </Container>;
};
