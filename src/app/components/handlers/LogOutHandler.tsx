import React, {useEffect} from 'react';
import {logOutUser, useAppDispatch} from "../../state";
import {IsaacSpinner} from "./IsaacSpinner";

export const LogOutHandler = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(logOutUser());
    }, []);
    return <>
        <div className="w-100 text-center">
            <h2 className="pt-7 pb-2">
                Logging out...
            </h2>
            <IsaacSpinner />
        </div>
    </>;
};
