import React, {useEffect} from "react";
import {PotentialUser} from "../../../IsaacAppTypes";
import {saveGameboard, useAppDispatch} from "../../state";
import {useNavigate, useParams} from "react-router-dom";
import {IsaacSpinner} from "./IsaacSpinner";
import {siteSpecific} from "../../services";
import {Container} from "reactstrap";

export const AddGameboard = ({user}: {user: PotentialUser}) => {
    const {gameboardId, gameboardTitle} = useParams<{gameboardId: string; gameboardTitle: string}>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        void dispatch(saveGameboard({
            boardId: gameboardId ?? "",
            user,
            boardTitle: gameboardTitle ? decodeURIComponent(gameboardTitle) : undefined,
            redirectOnSuccess: true
        })).then(action => {
            if (saveGameboard.rejected.match(action)) {
                void navigate(-1);
            }
        });
    }, [dispatch, saveGameboard, gameboardId]);

    return <Container className={"text-center"}>
        <IsaacSpinner size={"lg"} displayText={`Adding ${siteSpecific("question deck", "quiz")}...`}/>
    </Container>;
};
