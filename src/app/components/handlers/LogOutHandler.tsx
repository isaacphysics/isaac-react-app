import React, {useEffect} from 'react';
import {logOutUser, useAppDispatch} from "../../state";
import {IsaacSpinner} from "./IsaacSpinner";
import { useTranslation } from "react-i18next";

export const LogOutHandler = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(logOutUser());
    }, []);
    return <>
        <div className="w-100 text-center">
            <div className="pt-7 pb-2 h2">
                {t("common:auth.logout.loggingOut")}
            </div>
            <IsaacSpinner />
        </div>
    </>;
};
