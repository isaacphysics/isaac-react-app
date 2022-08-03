import React, {useEffect} from "react";
import {PotentialUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "./ShowLoading";
import {saveGameboard, useAppDispatch} from "../../state";
import {RouteComponentProps, withRouter} from "react-router-dom";
import * as RS from "reactstrap";

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
        }));
    }, [dispatch, saveGameboard, gameboardId]);

    return <ShowLoading until={false}>
        {/* FIXME - why did the line below exist? It was shown every time you added a gameboard, briefly>? */}
        {/*Something went wrong when attempting to add the gameboard.*/}
        {/* Add some holding text instead: */}
        <RS.Container>
            <p className="h3 mt-5">Adding gameboard...</p>
        </RS.Container>
    </ShowLoading>
};

export const AddGameboard = withRouter(AddGameboardComponent);
