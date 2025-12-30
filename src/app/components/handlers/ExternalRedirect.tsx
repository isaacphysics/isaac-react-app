import React from "react";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {useParams} from "react-router-dom";
import {Loading} from "./IsaacSpinner";
import {Navigate} from "react-router";
import {TrackedRoute} from "../navigation/TrackedRoute";
import {LoggedInUser, PotentialUser} from "../../../IsaacAppTypes";
import {Immutable} from "immer";
import { RequireAuth } from "../navigation/UserAuthentication";

interface ExternalRedirectBaseProps {
    from: string;
}
type ExternalRedirectProps<Params extends { [K in keyof Params]: string }> = ExternalRedirectBaseProps & ({
    to: (routeParams: Params) => `https://${string}` | undefined | null;
    ifUser?: never;
} | {
    to: (routeParams: Params, user: Immutable<RegisteredUserDTO> | null) => `https://${string}` | undefined | null;
    ifUser: (user: Immutable<PotentialUser> | null) => user is Immutable<LoggedInUser>;
});

export function ExternalRedirect<Params extends { [K in keyof Params]: string } = {}>({from, to, ifUser}: ExternalRedirectProps<Params>) {
    const ExternalRedirectInner = ({user}: {user: Immutable<RegisteredUserDTO> | null}) => {
        const params = useParams<Params>() as unknown as Params;
        const redirectURL = ifUser ? to(params, user) : to(params);
        if (redirectURL) {
            window.location.replace(redirectURL);
            return <Loading/>;
        }
        // Redirect to home page if the `redirectURL` cannot be built
        console.error("Problem building external redirect URL, redirecting to homepage...");
        return <Navigate to={"/"}/>;
    };
    return ifUser 
        ? <TrackedRoute path={from} element={<RequireAuth auth={ifUser} element={(authUser) => <ExternalRedirectInner user={authUser} />} />} />
        : <TrackedRoute path={from} element={<ExternalRedirectInner user={null} />} />;
}
