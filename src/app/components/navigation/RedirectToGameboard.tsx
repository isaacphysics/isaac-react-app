import React from "react";
import {Redirect, RouteComponentProps} from "react-router";
import {PATHS, trackPageview} from "../../services";

export const RedirectToGameboard = ({match: {params: {gameboardId}}}: RouteComponentProps<{gameboardId: string}>) => {
    trackPageview();
    return <Redirect to={`${PATHS.GAMEBOARD}#${gameboardId}`} />;
};
