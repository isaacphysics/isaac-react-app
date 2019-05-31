import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom"
import {Container} from "reactstrap"
import {loadGameboard} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {GameboardDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";

const stateFromProps = (state: AppState, currentProps: object) => (state && {gameboard: state.currentGameboard});
const dispatchFromProps = {loadGameboard};

interface GameboardPageProps {
    location: {hash: string};
    gameboard: GameboardDTO | null;
    loadGameboard: (gameboardId: string | null) => void;
}
const GameboardPageComponent = ({location: {hash}, gameboard, loadGameboard}: GameboardPageProps) => {
    useEffect(() => {loadGameboard(hash || null);}, [hash]);

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
