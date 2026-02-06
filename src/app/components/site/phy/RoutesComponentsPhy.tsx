import React from "react";
import { Navigate, useParams } from "react-router";
import { PATHS } from "../../../services";

export const BoardIdRedirect = () => {
    const { id } = useParams();
    return <Navigate to={`${PATHS.GAMEBOARD}#${id}`} replace />;
};

export const RedirectToGameboard = () => {
    const {gameboardId} = useParams();
    return <Navigate to={`${PATHS.GAMEBOARD}#${gameboardId}`} />;
};
