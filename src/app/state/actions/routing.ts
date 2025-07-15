import {createAction} from "@reduxjs/toolkit";
import {isAda, isTeacherOrAbove, KEY, persistence} from "../../services";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";

export const routerPageChange = createAction<string>("routerPageChange");

export const getAfterAuthPath = (user: RegisteredUserDTO) => {
    const pathOverride = persistence.pop(KEY.AFTER_AUTH_PATH);
    if (pathOverride) {
        return pathOverride;
    } else if ((isTeacherOrAbove(user) && isAda)) {
        return "/dashboard";
    }
    return "/";
};