import React, {useEffect} from 'react';
import {IsaacSpinner} from "./IsaacSpinner";
import {authApi} from "../../state/slices/api/auth";

export const LogOutHandler = () => {
    const [ logoutTrigger ] = authApi.endpoints.logout.useMutation();
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
