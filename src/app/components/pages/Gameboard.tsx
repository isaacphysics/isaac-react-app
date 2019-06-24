import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom"
import {loadGameboard, logAction} from "../../state/actions";
import {Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap"
import {ShowLoading} from "../handlers/ShowLoading";
import {GameboardDTO, GameboardItem} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {NOT_FOUND} from "../../services/constants";

const stateFromProps = (state: AppState) => (state && {gameboard: state.currentGameboard});
const dispatchFromProps = {loadGameboard, logAction};

interface GameboardPageProps {
    location: {hash: string};
    gameboard: GameboardDTO | NOT_FOUND_TYPE | null;
    loadGameboard: (gameboardId: string | null) => void;
    logAction: (eventDetails: object) => void;
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

    return <ListGroupItem key={question.id} className={itemClasses}>
        <Link to={`/questions/${question.id}?board=${gameboard.id}`}>
            <span>{icon}</span>
            <span>{question.title}</span>
            {tryAgain && <span className="try-again">try again!</span>}
        </Link>
    </ListGroupItem>;
};

const GameboardPageComponent = ({location: {hash}, gameboard, loadGameboard, logAction}: GameboardPageProps) => {
    let gameboardId = hash ? hash.slice(1) : null;

    useEffect(() => {loadGameboard(gameboardId);}, [gameboardId]);

    // Only log a gameboard view when we have a gameboard loaded:
    useEffect(() => {
        if (gameboard !== null && gameboard !== NOT_FOUND) {
            logAction({type: "VIEW_GAMEBOARD_BY_ID", gameboardId: gameboard.id});
        }
    }, [gameboard]);

    return <Container>
        <ShowLoading until={gameboard} render={gameboard =>
            <React.Fragment>
                <TitleAndBreadcrumb currentPageTitle={gameboard && gameboard.title || "Filter Generated Gameboard"} />
                <Row>
                    <Col lg={{size: 10, offset: 1}}>
                        <ListGroup className="mt-4 mb-5 mt-lg-5 link-list list-group-links list-gameboard">
                            {gameboard && gameboard.questions && gameboard.questions.map(
                                gameboardItem.bind(null, gameboard)
                            )}
                        </ListGroup>
                    </Col>
                </Row>
            </React.Fragment>} />
    </Container>;
};

export const Gameboard = withRouter(connect(stateFromProps, dispatchFromProps)(GameboardPageComponent));
