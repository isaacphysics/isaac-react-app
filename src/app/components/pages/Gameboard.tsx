import React, {useEffect} from "react";
import {
    AppState,
    logAction,
    selectors,
    setAssignBoardPath,
    useAppDispatch,
    useAppSelector, useGetGameboardByIdQuery,
    useGetMyAssignmentsQuery
} from "../../state";
import {Link, withRouter} from "react-router-dom";
import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap";
import {GameboardDTO, GameboardItem, IsaacWildcard} from "../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    AUDIENCE_DISPLAY_FIELDS,
    below,
    determineAudienceViews,
    filterAudienceViewsByProperties,
    generateQuestionTitle,
    isAda,
    isDefined,
    isFound,
    isNotPartiallyLoggedIn,
    isPhy,
    isTutorOrAbove, PATHS,
    showWildcard,
    siteSpecific,
    TAG_ID,
    tags,
    useDeviceSize,
    useUserViewingContext
} from "../../services";
import {Redirect} from "react-router";
import {StageAndDifficultySummaryIcons} from "../elements/StageAndDifficultySummaryIcons";
import {Markup} from "../elements/markup";
import classNames from "classnames";
import {skipToken} from "@reduxjs/toolkit/query";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import { GameboardSidebar, MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";

export const getProgressIcon = (question: GameboardItem) => {
    const itemClasses = classNames("content-summary-link text-info", {"p-3": isPhy, "p-0": isAda});
    let backgroundColor = "white";
    let icon = siteSpecific("icon-not-started", "/assets/cs/icons/question-not-started.svg");
    let message = siteSpecific("", "Not started");
    switch (question.state) {
        case "PERFECT":
            if (isPhy) {
                backgroundColor = "correct";
            }
            message = "Correct";
            icon = siteSpecific("icon-correct", "/assets/cs/icons/question-correct.svg");
            break;
        case "PASSED":
        case "IN_PROGRESS":
            message = "In progress";
            icon = siteSpecific("icon-in-progress", "/assets/cs/icons/question-in-progress.svg");
            break;
        case "FAILED":
            message = "Try again";
            icon = siteSpecific("icon-incorrect", "/assets/cs/icons/question-incorrect.svg");
            break;
    }
    return {itemClasses: classNames(itemClasses, `bg-${backgroundColor}`), icon, message};
};

const GameboardItemComponent = ({gameboard, question}: {gameboard: GameboardDTO, question: GameboardItem}) => {
    const {itemClasses, icon, message} = getProgressIcon(question);

    const questionTags = tags.getByIdsAsHierarchy((question.tags || []) as TAG_ID[])
        .filter((t, i) => !isAda || i !== 0); // CS always has Computer Science at the top level

    const questionViewingContexts = filterAudienceViewsByProperties(determineAudienceViews(question.audience, question.creationContext), AUDIENCE_DISPLAY_FIELDS);
    const userViewingContext = useUserViewingContext();
    const deviceSize = useDeviceSize();
    const currentUser = useAppSelector((state: AppState) => state?.user?.loggedIn && state.user || null);
    const uniqueStage = questionViewingContexts.find(context => context.stage === userViewingContext.stage);
    return <ListGroupItem key={question.id} className={itemClasses}>
        <Link to={`/questions/${question.id}?board=${gameboard.id}`} className={classNames("position-relative", {"align-items-center": isPhy, "justify-content-center": isAda})}>
            <span className={"question-progress-icon"}>
                {siteSpecific(
                    <div className={`${icon} me-3`}/>,
                    <div className={"inner-progress-icon"}>
                        <img src={icon} alt="" /><br/>
                        <span className={"icon-title d-none d-sm-block"}>{message}</span>
                    </div>
                )}
            </span>
            <div className={classNames({"d-flex py-3 pe-3 flex-column flex-md-row flex-fill": isAda, "d-flex flex-column flex-sm-row align-items-sm-center w-100": isPhy})}>
                <div>
                    <Markup encoding={"latex"} className={classNames( "link-title question-link-title", {"text-theme me-2": isPhy})}>
                        {generateQuestionTitle(question)}
                    </Markup>
                    {isPhy && question.subtitle && <div className="small text-muted d-none d-sm-block">
                        {question.subtitle}
                    </div>}
                    {questionTags && <div className={classNames("hierarchy-tags", {"mt-2": isAda})}>
                        {questionTags.map(tag => (<span className="hierarchy-tag" key={tag.id}>{tag.title}</span>))}
                    </div>}
                </div>
                {question.audience && <span className="ms-sm-auto w-max-content">
                    <StageAndDifficultySummaryIcons stack={isAda && below['sm'](deviceSize)} audienceViews={
                        isPhy && !isTutorOrAbove(currentUser) && uniqueStage ? [uniqueStage] : questionViewingContexts
                    } />
                </span>}
            </div>
            {isAda && <div className={"list-caret vertical-center"}><img src={"/assets/common/icons/chevron_right.svg"} alt={"Go to question"}/></div>}
        </Link>
    </ListGroupItem>;
};

export const Wildcard = ({wildcard}: {wildcard: IsaacWildcard}) => {
    return <ListGroupItem key={wildcard.id} className={"content-summary-link text-info bg-wildcard p-3"}>
        <a href={wildcard.url} className="align-items-center">
            <i className="icon icon-concept me-3" />
            <div className={"flex-grow-1"}>
                <span className="link-title question-link-title me-2">{wildcard.title}</span>
                {wildcard.description && <div className="hierarchy-tags">
                    <span className="hierarchy-tag">{wildcard.description}</span>
                </div>}
            </div>
        </a>
    </ListGroupItem>;
};

export const GameboardViewerInner = ({gameboard}: {gameboard: GameboardDTO}) => {
    return <ListGroup className="link-list list-group-links list-gameboard">
        {gameboard?.wildCard && showWildcard(gameboard) &&
            <Wildcard wildcard={gameboard.wildCard} />
        }
        {gameboard?.contents && gameboard.contents.map(q =>
            <GameboardItemComponent key={q.id} gameboard={gameboard} question={q} />
        )}
    </ListGroup>;
};

export const GameboardViewer = ({gameboard, className}: {gameboard: GameboardDTO; className?: string}) => (
    <Row className={className}>
        <div className={isAda ? "col col-lg-10 offset-lg-1" : ""}>
            <GameboardViewerInner gameboard={gameboard}/>
        </div>
    </Row>
);

export const Gameboard = withRouter(({ location }) => {
    const dispatch = useAppDispatch();
    const gameboardId = location.hash ? location.hash.slice(1) : null;
    const gameboardQuery = useGetGameboardByIdQuery(gameboardId || skipToken);
    const { data: gameboard } = gameboardQuery;
    const user = useAppSelector(selectors.user.orNull);
    const queryArg = user?.loggedIn && isNotPartiallyLoggedIn(user) ? undefined : skipToken;
    const {data: assignments} = useGetMyAssignmentsQuery(queryArg, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    const thisGameboardAssignments = isDefined(gameboardId) && isDefined(assignments) && isFound(assignments) && (assignments.filter(a => a.gameboardId?.includes(gameboardId)));

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
            icon={{type: "hex", icon: "icon-error"}}
        />
        <h3 className="my-4">
            <small>
                {`We're sorry, we were not able to find a ${siteSpecific("question deck", "quiz")} with the id `}<code>{gameboardId}</code>{"."}
            </small>
        </h3>
    </>;
    return !gameboardId
        ? <Redirect to={PATHS.QUESTION_FINDER} />
        : <Container className="mb-7">
            <ShowLoadingQuery
                query={gameboardQuery}
                defaultErrorTitle={`Error fetching ${siteSpecific("question deck", "quiz")} with id: ${gameboardId}`}
                ifNotFound={notFoundComponent}
                thenRender={(gameboard) => {
                    return <>
                        <TitleAndBreadcrumb 
                            currentPageTitle={siteSpecific("Question deck", gameboard && gameboard.title || "Filter Generated Quiz")} icon={{type: "hex", icon: "icon-question-deck"}}
                            intermediateCrumbs={isPhy && thisGameboardAssignments && thisGameboardAssignments.length ? [{title: "Assignments", to: "/assignments"}] : []}
                        />
                        <SidebarLayout>
                            <GameboardSidebar gameboard={gameboard} assignments={thisGameboardAssignments}/>
                            <MainContent>
                                {isPhy && <h3 className="mt-3">{gameboard.title}</h3>}
                                <GameboardViewer gameboard={gameboard} className={siteSpecific("mt-3", "mt-4 mt-lg-7")} />
                                {user && isTutorOrAbove(user)
                                    ? <Row>
                                        <Col xs={{size: 10, offset: 1}} sm={{size: 8, offset: 2}} md={{size: 6, offset: 0}} lg={{size: 4, offset: 2}} xl={{size: 3, offset: 2}} className="mt-4">
                                            <Button tag={Link} to={`${PATHS.ADD_GAMEBOARD}/${gameboardId}`} color="keyline" block>
                                                {siteSpecific("Set as Assignment", "Set as assignment")}
                                            </Button>
                                        </Col>
                                        <Col xs={{size: 10, offset: 1}} sm={{size: 8, offset: 2}} md={{size: 6, offset: 0}} lg={4} xl={{size: 3, offset: 2}} className="mt-4">
                                            <Button tag={Link} to={{pathname: PATHS.GAMEBOARD_BUILDER, search: `?base=${gameboardId}`}} color="keyline" block>
                                                {siteSpecific("Duplicate and Edit", "Duplicate and edit")}
                                            </Button>
                                        </Col>
                                    </Row>
                                    : gameboard && !gameboard.savedToCurrentUser && <Row>
                                        <Col className="mt-4" sm={{size: 8, offset: 2}} md={{size: 4, offset: 4}}>
                                            <Button tag={Link} to={`${PATHS.ADD_GAMEBOARD}/${gameboardId}`}
                                                onClick={() => setAssignBoardPath(PATHS.SET_ASSIGNMENTS)}
                                                color="keyline" block
                                            >
                                                {siteSpecific("Save to My Question Decks", "Save to My quizzes")}
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
});
