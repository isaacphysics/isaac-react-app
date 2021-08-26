import React, {useEffect} from 'react';
import {useDispatch} from "react-redux";
import {logOutUser} from "../../state/actions";
import {IsaacSpinner} from "./IsaacSpinner";

export const LogOutHandler = () => {
    const dispatch = useDispatch();
    useEffect(() => {dispatch(logOutUser())});
    return <React.Fragment>
        <div className="w-100 text-center">
            <h2 className="pt-5 pb-2">
                Logging out...
            </h2>
            <IsaacSpinner />
        </div>
    </React.Fragment>
};
