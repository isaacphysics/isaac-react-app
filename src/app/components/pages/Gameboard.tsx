import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom"
import {loadGameboard, logAction} from "../../state/actions";
import * as RS from "reactstrap"
import {ShowLoading} from "../handlers/ShowLoading";
import {GameboardDTO, GameboardItem} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {isTeacher} from "../../services/user";

const stateFromProps = (state: AppState) => {
    return state && {
        gameboard: state.currentGameboard,
        user: state.user,
    };
};
const dispatchFromProps = {loadGameboard, logAction};

interface GameboardPageProps {
    location: {hash: string};
    gameboard: GameboardDTO | null;
    loadGameboard: (gameboardId: string | null) => void;
    logAction: (eventDetails: object) => void;
    user: LoggedInUser | null;
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

    return <RS.ListGroupItem key={question.id} className={itemClasses}>
        <Link to={`/questions/${question.id}?board=${gameboard.id}`}>
            <span>{icon}</span>
            <span>{question.title}</span>
            {tryAgain && <span className="try-again">try again!</span>}
        </Link>
    </RS.ListGroupItem>;
};

const GameboardPageComponent = ({location: {hash}, gameboard, user, loadGameboard, logAction}: GameboardPageProps) => {
    let gameboardId = hash ? hash.slice(1) : null;

    useEffect(() => {loadGameboard(gameboardId);}, [gameboardId]);

    // Only log a gameboard view when we have a gameboard loaded:
    useEffect(() => {
        if (gameboard !== null) {
            logAction({type: "VIEW_GAMEBOARD_BY_ID", gameboardId: gameboard.id});
        }
    }, [gameboard]);

    const setAssignmentButton = user && isTeacher(user) && <div className="text-center mt-4">
        <RS.Button tag={Link} to={`/add-gameboard/${gameboardId}`} color="primary" outline>
            Set as Assignment
        </RS.Button>
    </div>;

    return <RS.Container>
        <ShowLoading until={gameboard}>
            <TitleAndBreadcrumb currentPageTitle={gameboard && gameboard.title || "Filter Generated Gameboard"} />
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
                {setAssignmentButton}
            </div>
        </ShowLoading>
    </RS.Container>;
};

export const Gameboard = withRouter(connect(stateFromProps, dispatchFromProps)(GameboardPageComponent));
