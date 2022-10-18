import React from 'react';
import {getRTKQueryErrorMessage, useAppDispatch} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Col, Label, Row} from "reactstrap";
import {FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {SerializedError} from "@reduxjs/toolkit";
import {buildActiveModal} from "./ActiveModal";

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

const GameboardCreatedModalButtons = ({gameboardId, resetBuilder, closeModal}: {gameboardId: string | undefined, resetBuilder: () => void; closeModal: () => void}) => {
    return <Row>
        <Col className="mb-1">
            <Button
                tag={Link} to={`/add_gameboard/${gameboardId}`} color="secondary" block
                disabled={!gameboardId} onClick={closeModal}
            >
                Set as assignment
            </Button>
        </Col>
        <Col className="mb-1">
            <Button
                color="primary" outline
                onClick={() => {resetBuilder(); closeModal();}}
            >
                Create another board
            </Button>
        </Col>
        <Col className="mb-1">
            <Button
                tag={Link} to={`/set_assignments`} color="primary" outline
                onClick={closeModal}
            >
                View all of your boards
            </Button>
        </Col>
    </Row>
}

export const GameboardCreatedModal = buildActiveModal(
    "gameboard-created-modal",
    "GameboardCreatedModal",
    ({gameboardId, closeModal, error, resetBuilder}) => ({
        title: gameboardId ? "Gameboard created" : "Gameboard creation failed",
        body: () => {
            const errorMessage = getRTKQueryErrorMessage(error).message;
            return <div>
                {gameboardId
                    ? <GameboardSuccessfullyCreated/>
                    : <GameboardNotFound errorMessage={errorMessage}/>
                }
                {resetBuilder && <GameboardCreatedModalButtons closeModal={closeModal} resetBuilder={resetBuilder} gameboardId={gameboardId} />}
            </div>
        }
    })
);
