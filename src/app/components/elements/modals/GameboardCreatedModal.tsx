import React from 'react';
import {useAppDispatch, useAppSelector} from "../../../state/store";
import {AppState} from "../../../state/reducers";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import {closeActiveModal} from "../../../state/actions";
import {isFound} from "../../../services/miscUtils";

export const GameboardCreatedModal = () => {
    const dispatch = useAppDispatch();
    const gameboardIdSelector = useAppSelector((state: AppState) => state && isFound(state.currentGameboard) && state.currentGameboard.id);

    return <div>
        <RS.Row className="mb-2">
            <RS.Label className="mx-3" htmlFor={gameboardIdSelector ? "gameboard-created" : "gameboard-not-successfully-created"}>
                {gameboardIdSelector ?
                    "Your gameboard has been created. You can now set it as an assignment, create another board or view all of your boards." :
                    "Your gameboard was not successfully created."}
            </RS.Label>
        </RS.Row>
        <RS.Row>
            <RS.Col className="mb-1">
                <RS.Button
                    tag={Link} to={`/add_gameboard/${gameboardIdSelector}`} color="secondary" block
                    disabled={!gameboardIdSelector} onClick={() => dispatch(closeActiveModal())}
                >
                    Set as assignment
                </RS.Button>
            </RS.Col>
            <RS.Col className="mb-1">
                <RS.Button
                    tag={Link} to={`/gameboard_builder`} color="primary" outline
                    onClick={() => {window.location.reload(); dispatch(closeActiveModal());}}
                >
                    Create another board
                </RS.Button>
            </RS.Col>
            <RS.Col className="mb-1">
                <RS.Button
                    tag={Link} to={`/set_assignments`} color="primary" outline
                    onClick={() => dispatch(closeActiveModal())}
                >
                    View all of your boards
                </RS.Button>
            </RS.Col>
        </RS.Row>
    </div>
};
