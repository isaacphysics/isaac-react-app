import React, {useEffect} from 'react';
import {logOutUser, useAppDispatch} from "../../state";
import {IsaacSpinner} from "./IsaacSpinner";

export const LogOutHandler = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(logOutUser())}, [dispatch]);
    return <React.Fragment>
        <div className="w-100 text-center">
            <h2 className="pt-5 pb-2">
                Logging out...
            </h2>
            <IsaacSpinner />
        </div>
    </React.Fragment>
};
