import React from "react";
import {Navigate, useParams} from "react-router";
import {PATHS} from "../../services";

export const RedirectToGameboard = () => {
    const {gameboardId} = useParams();
    return <Navigate to={`${PATHS.GAMEBOARD}#${gameboardId}`} />;
};
