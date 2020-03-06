import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom"
import {loadGameboard, logAction} from "../../state/actions";
import * as RS from "reactstrap"
import {ShowLoading} from "../handlers/ShowLoading";
import {GameboardDTO, GameboardItem} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {NOT_FOUND, TAG_ID} from "../../services/constants";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {isTeacher} from "../../services/user";
import {Redirect} from "react-router";
import {Container} from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import tags from "../../services/tags";

const stateFromProps = (state: AppState) => {
    return state && {
        gameboard: state.currentGameboard,
        user: state.user,
    };
};
const dispatchFromProps = {loadGameboard, logAction};

interface GameboardPageProps {
    location: {hash: string};
    gameboard: GameboardDTO | NOT_FOUND_TYPE | null;
    loadGameboard: (gameboardId: string | null) => void;
    logAction: (eventDetails: object) => void;
    user: LoggedInUser | null;
}

function getTags(docTags?: string[]) {
    if (SITE_SUBJECT !== SITE.PHY) {
        return [];
    }
    if (!docTags) return [];

    return tags.getByIdsAsHeirarchy(docTags as TAG_ID[]);
}

const gameboardItem = (gameboard: GameboardDTO, question: GameboardItem) => {
    let itemClasses = "p-3 content-summary-link text-info bg-transparent";
    let icon = "Q";
    let tryAgain = false;

    switch (question.state) {
        case "PERFECT":
            itemClasses += " bg-success";
            icon = "✓";
            break;
        case "PASSED":
        case "IN_PROGRESS":
        case "FAILED":
            tryAgain = true;
            break;
    }

    const tags = getTags(question.tags);

    return <RS.ListGroupItem key={question.id} className={itemClasses}>
        <Link to={`/questions/${question.id}?board=${gameboard.id}`}>
            <span>{icon}</span>
            <div className="flex-grow-1">{question.title}
                {tryAgain && <span className="try-again">try again!</span>}
                {tags && <div className="gameboard-tags">
                    {tags.map(tag => (<span className="gameboard-tag" key={tag.id}>{tag.title}</span>))}
                </div>}
            </div>
            {question.level !== undefined && question.level !== 0 &&
                <span className="gameboard-tags">Level {question.level}</span>}
        </Link>
    </RS.ListGroupItem>;
};

const GameboardPageComponent = ({location: {hash}, gameboard, user, loadGameboard, logAction}: GameboardPageProps) => {
    let gameboardId = hash ? hash.slice(1) : null;

    useEffect(() => {loadGameboard(gameboardId);}, [gameboardId]);

    // Only log a gameboard view when we have a gameboard loaded:
    useEffect(() => {
        if (gameboard !== null && gameboard !== NOT_FOUND) {
            logAction({type: "VIEW_GAMEBOARD_BY_ID", gameboardId: gameboard.id});
        }
    }, [gameboard]);

    const userButtons = user && isTeacher(user) ?
        <RS.Row className="col-8 offset-2">
            <RS.Col className="mt-4">
                <RS.Button tag={Link} to={`/add_gameboard/${gameboardId}`} color="primary" outline className="btn-block">
                    Set as assignment
                </RS.Button>
            </RS.Col>
            <RS.Col className="mt-4">
                <RS.Button
                    tag={Link} to={{pathname: "/gameboard_builder", search: `?base=${gameboardId}`}}
                    color="primary" block outline
                >
                    Duplicate and edit
                </RS.Button>
            </RS.Col>
        </RS.Row>
        :
        <RS.Row className="col-4 offset-2 offset-md-4">
            <RS.Col className="mt-4">
                <RS.Button tag={Link} to={`/add_gameboard/${gameboardId}`} color="primary" outline className="btn-block">
                    Save to My gameboards
                </RS.Button>
            </RS.Col>
        </RS.Row>;

    const notFoundComponent = <Container>
        <TitleAndBreadcrumb breadcrumbTitleOverride="Gameboard" currentPageTitle="Gameboard not found" />
        <h3 className="my-4">
            <small>
                {"We're sorry, we were not able to find a gameboard with the id "}
                <code>{gameboardId}</code>
                {"."}
            </small>
        </h3>
    </Container>;

    return gameboardId ?
        <RS.Container>
            <ShowLoading
                until={gameboard}
                thenRender={gameboard => <React.Fragment>
                    <TitleAndBreadcrumb currentPageTitle={gameboard && gameboard.title || "Filter Generated Gameboard"}/>
                    <div className="mb-5">
                        <RS.Row>
                            <RS.Col lg={{size: 10, offset: 1}}>
                                <RS.ListGroup className="mt-4 mt-lg-5 link-list list-group-links list-gameboard">
                                    {gameboard && gameboard.questions && gameboard.questions.map(
                                        gameboardItem.bind(null, gameboard)
                                    )}
                                </RS.ListGroup>
                            </RS.Col>
                        </RS.Row>
                        {userButtons}
                    </div>
                </React.Fragment>}
                ifNotFound={notFoundComponent}
            />
        </RS.Container>
        :
        <Redirect to="/gameboards#example-gameboard" />
};

export const Gameboard = withRouter(connect(stateFromProps, dispatchFromProps)(GameboardPageComponent));
