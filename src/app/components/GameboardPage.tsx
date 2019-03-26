import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom"
import {loadGameboard} from "../state/actions";
import {ShowLoading} from "./ShowLoading";

const stateFromProps = (state: any, currentProps: object) => ({gameboard: state.currentGameboard});
const dispatchFromProps = {loadGameboard};

const GameboardPageComponent = ({location: {hash}, gameboard, loadGameboard}: any) => {
    useEffect(
        () => {loadGameboard(hash || null);},
        [hash]
    );

    return (
        <ShowLoading until={gameboard}>
            <h2>{gameboard && gameboard.title || "Filter Generated Gameboard"}</h2>
            <hr />
            {gameboard && gameboard.questions.map((question: any, index: number) =>
                <div key={index}>
                    <hr />
                    <h3><Link to={`/questions/${question.id}?board=${gameboard.id}`}>{question.title}</Link></h3>
                    State: {question.state}
                    <hr />
                </div>
            )}
        </ShowLoading>
    );
};

export const GameboardPage = withRouter(connect(stateFromProps, dispatchFromProps)(GameboardPageComponent));
