import React from 'react';
import {closeActiveModal, getRTKQueryErrorMessage, useAppDispatch} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Col, Label, Row} from "reactstrap";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {PATHS, siteSpecific} from "../../../services";

const GameboardNotFound = ({errorMessage}: {errorMessage: string}) =>
    <Row className="mb-2">
        <Label className="mx-3">
            Your {siteSpecific("gameboard", "quiz")} was not successfully created.
            <br/>
            {errorMessage}
        </Label>
    </Row>;

const GameboardSuccessfullyCreated = () =>
    <Row className="mb-2">
        <Label className="mx-3">
            Your {siteSpecific("gameboard", "quiz")} has been created. You can now set it as an assignment, create another {siteSpecific("board", "quiz")} or view all of your {siteSpecific("boards", "quizzes")}.
        </Label>
    </Row>;

const GameboardCreatedModalButtons = ({gameboardId, resetBuilder}: {gameboardId: string | undefined, resetBuilder: () => void}) => {
    const dispatch = useAppDispatch();
    const closeModal = () => dispatch(closeActiveModal());
    return <Row className={"my-3"}>
        <Col sm={12} lg={4} className="mb-1">
            <Button
                className="w-100 h-100" tag={Link} to={`${PATHS.ADD_GAMEBOARD}/${gameboardId}`} color="secondary" block
                disabled={!gameboardId} onClick={closeModal}
            >
                Set as assignment
            </Button>
        </Col>
        <Col sm={12} lg={4} className="mb-1">
            <Button
                className="w-100 h-100" color="primary" outline
                onClick={() => {resetBuilder(); closeModal();}}
            >
                Create another {siteSpecific("board", "quiz")}
            </Button>
        </Col>
        <Col sm={12} lg={4} className="mb-1">
            <Button
                className="w-100 h-100" tag={Link} to={PATHS.SET_ASSIGNMENTS} color="primary" outline
                onClick={closeModal}
            >
                View all of your {siteSpecific("boards", "quizzes")}
            </Button>
        </Col>
    </Row>
}

export const GameboardCreatedModal = ({gameboardId, error, resetBuilder}: {gameboardId: string | undefined, error: FetchBaseQueryError | SerializedError | undefined, resetBuilder: () => void}) => {
    const errorMessage = getRTKQueryErrorMessage(error).message;
    return <div>
        {gameboardId
            ? <GameboardSuccessfullyCreated/>
            : <GameboardNotFound errorMessage={errorMessage}/>
        }
        <GameboardCreatedModalButtons resetBuilder={resetBuilder} gameboardId={gameboardId} />
    </div>;
};
