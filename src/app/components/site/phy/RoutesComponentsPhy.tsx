import React from "react";
import { Navigate, useParams } from "react-router";
import { PATHS } from "../../../services";

export const BoardIdRedirect = () => {
    const { id } = useParams();
    return <Navigate to={`${PATHS.GAMEBOARD}#${id}`} replace />;
};

export const AddGameboardRedirect = () => {
    const { id } = useParams();
    return <Navigate to={`${PATHS.ADD_GAMEBOARD}/${id}`} replace />;
};
