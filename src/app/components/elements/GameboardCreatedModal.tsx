import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import classnames from "classnames";
import {closeActiveModal} from "../../state/actions";
import {resourceFound} from "../../services/validation";

export const GameboardCreatedModal = () => {
    const dispatch = useDispatch();
    const gameboardIdSelector = useSelector((state: AppState) => state && resourceFound(state.currentGameboard) && state.currentGameboard.id);

    return <div>
        <RS.Row className="mb-3">
            <RS.Label className="mx-3"
                      htmlFor={gameboardIdSelector ? "gameboard-created" : "gameboard-not-successfully-created"}>
                {gameboardIdSelector ? "Your gameboard has been created. You can now set it as an assignment, create another board or view all of your boards." :
                "Your gameboard was not successfully created."}
            </RS.Label>
        </RS.Row>
        <RS.Row>
            <RS.Col>
                <RS.Button
                    tag={Link}
                    to={`/gameboards#${gameboardIdSelector}`}
                    className={"btn btn-block btn-secondary border-0 " + classnames({disabled: !gameboardIdSelector})}
                    disabled={!gameboardIdSelector}
                    onClick={() => dispatch(closeActiveModal())}>
                    Set as Assignment
                </RS.Button>
            </RS.Col>
            <RS.Col>
                <RS.Button tag={Link}
                           to={`/gameboards/builder`}
                           color="primary"
                           outline
                           onClick={() => dispatch(closeActiveModal())}>>
                    Create another board
                </RS.Button>
            </RS.Col>
            <RS.Col>
                <RS.Button tag={Link}
                           to={`/set_assignment`}
                           color="primary"
                           outline
                           onClick={() => dispatch(closeActiveModal())}>>
                    View all of your boards
                </RS.Button>
            </RS.Col>
        </RS.Row>
    </div>
};
