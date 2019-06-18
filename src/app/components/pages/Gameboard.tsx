import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom"
import {Container, ListGroup, ListGroupItem} from "reactstrap"
import {loadGameboard} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {GameboardDTO, GameboardItem} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";

const stateFromProps = (state: AppState) => (state && {gameboard: state.currentGameboard});
const dispatchFromProps = {loadGameboard};

interface GameboardPageProps {
    location: {hash: string};
    gameboard: GameboardDTO | null;
    loadGameboard: (gameboardId: string | null) => void;
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
        <Link to={`/questions/${question.id}?board=${gameboard.id}`}><span>{icon}</span><span>{question.title}</span>{tryAgain && <span className="try-again">try again!</span>}</Link>
    </ListGroupItem>;
};


const GameboardPageComponent = ({location: {hash}, gameboard, loadGameboard}: GameboardPageProps) => {
    useEffect(() => {loadGameboard(hash || null);}, [hash]);

    return <Container>
        <ShowLoading until={gameboard}>
            <h2 className="mt-2 mb-4">{gameboard && gameboard.title || "Filter Generated Gameboard"}</h2>
            <ListGroup className="mb-3 link-list list-group-links list-gameboard">
                {gameboard && gameboard.questions && gameboard.questions.map(gameboardItem.bind(null, gameboard))}
            </ListGroup>
        </ShowLoading>
    </Container>;
};

export const Gameboard = withRouter(connect(stateFromProps, dispatchFromProps)(GameboardPageComponent));
