import React, {useEffect} from "react";
import {PotentialUser} from "../../../IsaacAppTypes";
import {saveGameboard, useAppDispatch} from "../../state";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {IsaacSpinner} from "./IsaacSpinner";
import {history} from "../../services";
import {Container} from "reactstrap";

interface AddGameboardProps extends RouteComponentProps<{ gameboardId: string; gameboardTitle: string }> {
    user: PotentialUser;
}

const AddGameboardComponent = (props: AddGameboardProps) => {
    const {user, match: {params: {gameboardId, gameboardTitle}}} = props;
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
        <IsaacSpinner size={"lg"} displayText={"Adding gameboard..."}/>
    </Container>;
};

export const AddGameboard = withRouter(AddGameboardComponent);
