import React, {useEffect} from "react";
import {
    isaacApi,
    logAction,
    selectors,
    setAssignBoardPath,
    useAppDispatch,
    useAppSelector
} from "../../state";
import {Link, withRouter} from "react-router-dom";
import * as RS from "reactstrap";
import {Container} from "reactstrap";
import {GameboardDTO, GameboardItem, IsaacWildcard} from "../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    AUDIENCE_DISPLAY_FIELDS,
    determineAudienceViews,
    filterAudienceViewsByProperties,
    generateQuestionTitle,
    isAda,
    isDefined,
    isFound,
    isPhy,
    isTutorOrAbove, PATHS,
    showWildcard,
    siteSpecific,
    TAG_ID,
    TAG_LEVEL,
    tags
} from "../../services";
import {Redirect} from "react-router";
import queryString from "query-string";
import {StageAndDifficultySummaryIcons} from "../elements/StageAndDifficultySummaryIcons";
import {Markup} from "../elements/markup";
import classNames from "classnames";
import {skipToken} from "@reduxjs/toolkit/query";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";

function extractFilterQueryString(gameboard: GameboardDTO): string {
    const csvQuery: {[key: string]: string} = {}
    if (gameboard.gameFilter) {
        Object.entries(gameboard.gameFilter).forEach(([key, values]) => {
            csvQuery[key] = values.join(",");
        });
    }
    return queryString.stringify(csvQuery, {encode: false});
}

const GameboardItemComponent = ({gameboard, question}: {gameboard: GameboardDTO, question: GameboardItem}) => {
    let itemClasses = classNames("content-summary-link text-info bg-transparent", {"p-3": isPhy, "p-0": isAda});
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, question.tags as TAG_ID[]);
    const iconClasses = `gameboard-item-icon ${itemSubject?.id}-fill`;
    let iconHref = siteSpecific("/assets/question-hex.svg#icon", "/assets/question.svg");
    let message = "";
    let messageClasses = "";

    switch (question.state) {
        case "PERFECT":
            itemClasses += " bg-success";
            message = "perfect!"
            iconHref = siteSpecific("/assets/tick-rp-hex.svg#icon", "/assets/tick-rp.svg");
            break;
        case "PASSED":
        case "IN_PROGRESS":
            message = "in progress"
            iconHref = siteSpecific("/assets/incomplete-hex.svg#icon", "/assets/incomplete.svg");
            break;
        case "FAILED":
            message = "try again!"
            iconHref = siteSpecific("/assets/cross-rp-hex.svg#icon", "/assets/cross-rp.svg");
            break;
    }

    const questionTags = tags.getByIdsAsHierarchy((question.tags || []) as TAG_ID[])
        .filter((t, i) => !isAda || i !== 0); // CS always has Computer Science at the top level

    return <RS.ListGroupItem key={question.id} className={itemClasses}>
        <Link to={`/questions/${question.id}?board=${gameboard.id}`} className={classNames("position-relative", {"align-items-center": isPhy, "pl-3 justify-content-center": isAda})}>
            {isPhy && <span>
                <svg className={iconClasses}><use href={iconHref} xlinkHref={iconHref}/></svg>
            </span>}
            <div className={classNames("d-md-flex flex-fill", {"py-3 pr-3": isAda})}>
                {/* TODO CP shouldn't the subject colour here depend on the contents/tags of the gameboard? */}
                <div className={"flex-grow-1 " + (itemSubject?.id ?? (isPhy ? "physics" : ""))}>
                    <Markup encoding={"latex"} className={classNames( "question-link-title", {"text-secondary": isPhy})}>
                        {generateQuestionTitle(question)}
                    </Markup>
                    {message && <span className={"gameboard-item-message" + (isPhy ? "-phy " : " ") + messageClasses}>{message}</span>}
                    {questionTags && <div className={classNames("hierarchy-tags", {"mt-2": isAda})}>
                        {questionTags.map(tag => (<span className="hierarchy-tag" key={tag.id}>{tag.title}</span>))}
                    </div>}
                </div>

                {question.audience && <StageAndDifficultySummaryIcons audienceViews={
                    filterAudienceViewsByProperties(determineAudienceViews(question.audience, question.creationContext), AUDIENCE_DISPLAY_FIELDS)
                } />}
            </div>
            {isAda && <div className={"list-caret vertical-center"}><img src={"/assets/chevron_right.svg"}/></div>}
        </Link>
    </RS.ListGroupItem>;
};

export const Wildcard = ({wildcard}: {wildcard: IsaacWildcard}) => {
    const itemClasses = "p-3 content-summary-link text-info bg-transparent";
    const icon = <img src="/assets/wildcard.svg" alt="Optional extra information icon"/>;
    return <RS.ListGroupItem key={wildcard.id} className={itemClasses}>
        <a href={wildcard.url} className="align-items-center">
            <span className="gameboard-item-icon">{icon}</span>
            <div className={"flex-grow-1"}>
                <span>{wildcard.title}</span>
                {wildcard.description && <div className="hierarchy-tags">
                    <span className="hierarchy-tag">{wildcard.description}</span>
                </div>}
            </div>
        </a>
    </RS.ListGroupItem>
}

export const GameboardViewerInner = ({gameboard}: {gameboard: GameboardDTO}) => {
    return <RS.ListGroup className="link-list list-group-links list-gameboard">
        {gameboard?.wildCard && showWildcard(gameboard) &&
            <Wildcard wildcard={gameboard.wildCard} />
        }
        {gameboard?.contents && gameboard.contents.map(q =>
            <GameboardItemComponent key={q.id} gameboard={gameboard} question={q} />
        )}
    </RS.ListGroup>
};

export const GameboardViewer = ({gameboard, className}: {gameboard: GameboardDTO; className?: string}) => (
    <RS.Row className={className}>
        <RS.Col lg={{size: 10, offset: 1}}>
            <GameboardViewerInner gameboard={gameboard}/>
        </RS.Col>
    </RS.Row>
);

export const Gameboard = withRouter(({ location }) => {
    const dispatch = useAppDispatch();
    const gameboardId = location.hash ? location.hash.slice(1) : null;
    const gameboardQuery = isaacApi.endpoints.getGameboardById.useQuery(gameboardId || skipToken);
    const { data: gameboard } = gameboardQuery;
    const user = useAppSelector(selectors.user.orNull);

    // Show filter
    const {filter} = queryString.parse(location.search);
    let showFilter = false;
    if (filter) {
        const filterValue = filter instanceof Array ? filter[0] : filter;
        showFilter = isDefined(filterValue) && filterValue.toLowerCase() === "true";
    }

    // Only log a gameboard view when we have a gameboard loaded:
    useEffect(() => {
        if (isDefined(gameboard) && isFound(gameboard)) {
            dispatch(logAction({type: "VIEW_GAMEBOARD_BY_ID", gameboardId: gameboard.id}));
        }
    }, [dispatch, gameboard]);

    const notFoundComponent = <Container>
        <TitleAndBreadcrumb breadcrumbTitleOverride="Gameboard" currentPageTitle="Gameboard not found" />
        <h3 className="my-4">
            <small>
                {"We're sorry, we were not able to find a gameboard with the id "}<code>{gameboardId}</code>{"."}
            </small>
            {isPhy && <div className="mt-4 text-center">
                <RS.Button tag={Link} to={PATHS.QUESTION_FINDER} color="primary" outline className="btn-lg">
                    Generate a new gameboard
                </RS.Button>
            </div>}
        </h3>
    </Container>;

    return !gameboardId
        ? <Redirect to={PATHS.QUESTION_FINDER} />
        : <RS.Container className="mb-5">
            <ShowLoadingQuery
                query={gameboardQuery}
                defaultErrorTitle={`Error fetching gameboard with id: ${gameboardId}`}
                ifNotFound={notFoundComponent}
                thenRender={(gameboard) => {
                    if (showFilter) {
                        return <Redirect to={`${PATHS.QUESTION_FINDER}?${extractFilterQueryString(gameboard)}#${gameboardId}`} />
                    }
                    return <>
                        <TitleAndBreadcrumb currentPageTitle={gameboard && gameboard.title || "Filter Generated Gameboard"}/>
                        <GameboardViewer gameboard={gameboard} className="mt-4 mt-lg-5" />
                        {user && isTutorOrAbove(user)
                            ? <RS.Row className="col-8 offset-2">
                                <RS.Col className="mt-4">
                                    <RS.Button tag={Link} to={`/add_gameboard/${gameboardId}`} color="primary" outline className="btn-block">
                                        {siteSpecific("Set as Assignment", "Set as assignment")}
                                    </RS.Button>
                                </RS.Col>
                                <RS.Col className="mt-4">
                                    <RS.Button tag={Link} to={{pathname: "/gameboard_builder", search: `?base=${gameboardId}`}} color="primary" block outline>
                                        {siteSpecific("Duplicate and Edit", "Duplicate and edit")}
                                    </RS.Button>
                                </RS.Col>
                            </RS.Row>
                            : gameboard && !gameboard.savedToCurrentUser && <RS.Row>
                                <RS.Col className="mt-4" sm={{size: 8, offset: 2}} md={{size: 4, offset: 4}}>
                                    <RS.Button tag={Link} to={`/add_gameboard/${gameboardId}`}
                                               onClick={() => setAssignBoardPath("/set_assignments")}
                                               color="primary" outline className="btn-block"
                                    >
                                        {siteSpecific("Save to My Gameboards", "Save to My gameboards")}
                                    </RS.Button>
                                </RS.Col>
                            </RS.Row>
                        }
                    </>
                }}
            />
        </RS.Container>;
});
