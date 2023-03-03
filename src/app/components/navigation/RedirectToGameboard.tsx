import React from "react";
import {Redirect, RouteComponentProps} from "react-router";
import {PATHS} from "../../services";

export const RedirectToGameboard = ({match: {params: {gameboardId}}}: RouteComponentProps<{gameboardId: string}>) => {
    return <Redirect to={`${PATHS.GAMEBOARD}#${gameboardId}`} />;
};
