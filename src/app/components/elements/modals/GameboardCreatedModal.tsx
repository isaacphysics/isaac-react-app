import React from 'react';
import {closeActiveModal, getRTKQueryErrorMessage, useAppDispatch} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Col, Label, Row} from "reactstrap";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {PATHS, siteSpecific, isAda} from "../../../services";

const GameboardNotFound = ({errorMessage}: {errorMessage: string}) =>
    <Label className="mx-3 mb-2">
        Your {siteSpecific("question deck", "quiz")} was not successfully created.
        <br/>
        {errorMessage}
    </Label>;

const GameboardSuccessfullyCreated = () =>
    <Label className="mx-3 mb-2">
        Your {siteSpecific("question deck", "quiz")} has been created. You can now set it as an assignment, create another {siteSpecific("question deck", "quiz")} or view all of your {siteSpecific("question decks", "quizzes")}.
    </Label>;

const GameboardCreatedModalButtons = ({gameboardId, resetBuilder}: {gameboardId: string | undefined, resetBuilder: () => void}) => {
    const dispatch = useAppDispatch();
    const closeModal = () => dispatch(closeActiveModal());
    return <Row className={"my-3 d-flex justify-content-center"}>
        <Col sm={12} lg={siteSpecific("auto", 4)} className="mb-1">
            <Button
                className="w-100" tag={Link} to={`${PATHS.ADD_GAMEBOARD}/${gameboardId}`} color="secondary" block
                disabled={!gameboardId} onClick={closeModal}
            >
                Set as assignment
            </Button>
        </Col>
        <Col sm={12} lg={siteSpecific("auto", 4)} className="mb-1">
            <Button
                className="w-100" color="keyline"
                onClick={() => {resetBuilder(); closeModal();}}
            >
                Create another {siteSpecific("question deck", "quiz")}
            </Button>
        </Col>
        <Col sm={12} lg={siteSpecific("auto", 4)} className="mb-1">
            <Button
                className="w-100" tag={Link} to={PATHS.SET_ASSIGNMENTS} color="keyline"
                onClick={closeModal}
            >
                View all of your {siteSpecific("question decks", "quizzes")}
            </Button>
        </Col>
    </Row>;
};

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
