import React from 'react';
import {useAppDispatch} from "../../../state/store";
import {Link} from "react-router-dom";
import {closeActiveModal, extractRTKErrorMessage} from "../../../state/actions";
import {Button, Col, Label, Row} from "reactstrap";
import {FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {SerializedError} from "@reduxjs/toolkit";

const GameboardNotFound = ({errorMessage}: {errorMessage: string}) =>
    <Row className="mb-2">
        <Label className="mx-3">
            Your gameboard was not successfully created.
            <br/>
            {errorMessage}
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
                onClick={() => dispatch(closeActiveModal())}
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

export const GameboardCreatedModal = ({gameboardId, error}: {gameboardId: string | undefined, error: FetchBaseQueryError | SerializedError | undefined}) => {
    const errorMessage = extractRTKErrorMessage(error);
    return <div>
        {gameboardId
            ? <GameboardSuccessfullyCreated/>
            : <GameboardNotFound errorMessage={errorMessage}/>
        }
        <GameboardCreatedModalButtons gameboardId={gameboardId} />
    </div>;
};
