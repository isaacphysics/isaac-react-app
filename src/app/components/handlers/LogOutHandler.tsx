import React, {useEffect} from 'react';
import {IsaacSpinner} from "./IsaacSpinner";
import {isaacApi} from "../../state/slices/api";

export const LogOutHandler = () => {
    const [ logoutTrigger ] = isaacApi.endpoints.logout.useMutation();
    useEffect(() => {
        logoutTrigger();
    });
    return <React.Fragment>
        <div className="w-100 text-center">
            <h2 className="pt-5 pb-2">
                Logging out...
            </h2>
            <IsaacSpinner />
        </div>
    </React.Fragment>
};
