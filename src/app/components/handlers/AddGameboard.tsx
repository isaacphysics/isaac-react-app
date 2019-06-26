import React, {useEffect} from "react";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "./ShowLoading";
import {useDispatch} from "react-redux";
import {addGameboard} from "../../state/actions";
import {withRouter} from "react-router-dom";

interface AddGameboardProps {
    user: LoggedInUser;
    match: {params: {gameboardId: string}};
}

const AddGameboardComponent = (props: AddGameboardProps) => {
    const {user, match: {params: {gameboardId}}} = props;
    const dispatch = useDispatch();

    useEffect(() => {dispatch(addGameboard(gameboardId, user))}, [gameboardId]);

    return <ShowLoading until={false}>
        The Unreachable Dream
    </ShowLoading>
};

export const AddGameboard = withRouter(AddGameboardComponent);
