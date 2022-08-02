import React from 'react';
import {useAppDispatch, useAppSelector} from "../../../state/store";
import {Link} from "react-router-dom";
import {closeActiveModal} from "../../../state/actions";
import {isFound} from "../../../services/miscUtils";
import {selectors} from "../../../state/selectors";
import {ShowLoading} from "../../handlers/ShowLoading";
import {Button, Col, Label, Row} from "reactstrap";

const GameboardNotFound = () =>
    <Row className="mb-2">
        <Label className="mx-3">
            Your gameboard was not successfully created.
        </Label>
    </Row>;

const GameboardSuccessfullyCreated = () =>
    <Row className="mb-2">
        <Label className="mx-3">
            Your gameboard has been created. You can now set it as an assignment, create another board or view all of your boards.
        </Label>
    </Row>;

const GameboardCreatedModalButtons = ({gameboardId}: {gameboardId: string | undefined}) => {
    const dispatch = useAppDispatch();
    return <Row>
        <Col className="mb-1">
            <Button
                tag={Link} to={`/add_gameboard/${gameboardId}`} color="secondary" block
                disabled={!gameboardId} onClick={() => dispatch(closeActiveModal())}
            >
                Set as assignment
            </Button>
        </Col>
        <Col className="mb-1">
            <Button
                tag={Link} to={`/gameboard_builder`} color="primary" outline
                onClick={() => {window.location.reload(); dispatch(closeActiveModal());}}
            >
                Create another board
            </Button>
        </Col>
        <Col className="mb-1">
            <Button
                tag={Link} to={`/set_assignments`} color="primary" outline
                onClick={() => dispatch(closeActiveModal())}
            >
                View all of your boards
            </Button>
        </Col>
    </Row>
}

export const GameboardCreatedModal = () => {
    const gameboard = useAppSelector(selectors.board.currentGameboardOrNotFound);
    return <div>
        <ShowLoading until={gameboard}
                        ifNotFound={<><GameboardNotFound/><GameboardCreatedModalButtons gameboardId={undefined}/></>}>
            <>
                <GameboardSuccessfullyCreated/>
                <GameboardCreatedModalButtons gameboardId={(gameboard && isFound(gameboard) && gameboard.id) as string} />
            </>
        </ShowLoading>
    </div>
};
