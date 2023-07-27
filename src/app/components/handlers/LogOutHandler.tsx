import React, {useEffect} from 'react';
import {useLogoutMutation} from "../../state";
import {IsaacSpinner} from "./IsaacSpinner";

export const LogOutHandler = () => {
    const [logOutUser] = useLogoutMutation();
    useEffect(() => {
        logOutUser();
    }, []);
    return <>
        <div className="w-100 text-center">
            <h2 className="pt-5 pb-2">
                Logging out...
            </h2>
            <IsaacSpinner />
        </div>
    </>;
};
