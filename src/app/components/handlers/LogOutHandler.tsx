import React, {useEffect} from 'react';
import {logOutUser, useAppDispatch} from "../../state";
import {IsaacSpinner} from "./IsaacSpinner";
import { useTranslation } from 'react-i18next'

export const LogOutHandler = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(logOutUser());
    }, []);
    return <>
        <div className="w-100 text-center">
            <h2 className="pt-7 pb-2">
                {t('loggingOut', 'Logging out...')}
            </h2>
            <IsaacSpinner />
        </div>
    </>;
};
