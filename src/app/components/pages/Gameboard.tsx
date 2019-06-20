import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom"
import {Container} from "reactstrap"
import {loadGameboard, logAction} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {GameboardDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";

const stateFromProps = (state: AppState) => (state && {gameboard: state.currentGameboard});
const dispatchFromProps = {loadGameboard, logAction};

interface GameboardPageProps {
    location: {hash: string};
    gameboard: GameboardDTO | null;
    loadGameboard: (gameboardId: string | null) => void;
    logAction: (eventDetails: object) => void;
}

const GameboardPageComponent = ({location: {hash}, gameboard, loadGameboard, logAction}: GameboardPageProps) => {

    let gameboardId = hash ? hash.slice(1) : null;
    useEffect(() => {loadGameboard(gameboardId);}, [gameboardId]);

    // Only log a gameboard view when we have a gameboard loaded:
    useEffect(() => {
        if (gameboard !== null) {
            logAction({type: "VIEW_GAMEBOARD_BY_ID", gameboardId: gameboard.id});
        }
    }, [gameboard]);

    return <Container>
        <ShowLoading until={gameboard}>
            <h2>{gameboard && gameboard.title || "Filter Generated Gameboard"}</h2>
            <hr />
            {gameboard && gameboard.questions && gameboard.questions.map((question, index) =>
                <div key={index}>
                    <hr />
                    <h3><Link to={`/questions/${question.id}?board=${gameboard.id}`}>{question.title}</Link></h3>
                    State: {question.state}
                    <hr />
                </div>
            )}
        </ShowLoading>
    </Container>;
};

export const Gameboard = withRouter(connect(stateFromProps, dispatchFromProps)(GameboardPageComponent));
