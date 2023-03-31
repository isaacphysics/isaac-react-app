import React, {useEffect} from "react";
import {PotentialUser} from "../../../IsaacAppTypes";
import {saveGameboard, useAppDispatch} from "../../state";
import {useParams} from "react-router-dom";
import {IsaacSpinner} from "./IsaacSpinner";
import {history, siteSpecific} from "../../services";
import {Container} from "reactstrap";

export const AddGameboard = ({user}: {user: PotentialUser}) => {
    const {gameboardId, gameboardTitle} = useParams<{gameboardId: string; gameboardTitle: string}>();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(saveGameboard({
            boardId: gameboardId,
            user,
            boardTitle: gameboardTitle,
            redirectOnSuccess: true
        })).then(action => {
            if (saveGameboard.rejected.match(action)) {
                history.goBack();
            }
        });
    }, [dispatch, saveGameboard, gameboardId]);

    return <Container className={"text-center"}>
        <IsaacSpinner size={"lg"} displayText={`Adding ${siteSpecific("gameboard", "quiz")}...`}/>
    </Container>;
};
