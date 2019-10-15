import React, {useEffect} from "react";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {api} from "../../services/api";

export const FreeTextTest = ({user}: {user: LoggedInUser}) => {
    useEffect(() => {
        api.tests.freeTextRules();
    }, []);
    return <div>
        Hey.
    </div>
};
