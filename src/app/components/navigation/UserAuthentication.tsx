import React from "react";
import { LoggedInUser, PotentialUser } from "../../../IsaacAppTypes";
import { selectors, useAppSelector, useGetSegueEnvironmentQuery } from "../../state";
import {Immutable} from "immer";
import { ShowLoading } from "../handlers/ShowLoading";
import { isDefined, isTeacherPending, isTeacherOrAbove, isTutorOrAbove, KEY, persistence, TEACHER_REQUEST_ROUTE } from "../../services";
import { Navigate } from "react-router";
import { Unauthorised } from "../pages/Unauthorised";

type RequireAuthProps = {
    auth: (user: Immutable<PotentialUser> | null, env: string) => user is Immutable<LoggedInUser>;
    element: ((authUser: LoggedInUser) => React.ReactNode);
} | {
    auth: (user: Immutable<PotentialUser> | null, env: string) => boolean;
    element: React.ReactNode;
}

export const RequireAuth = ({auth, element}: RequireAuthProps) => {
    const user = useAppSelector(selectors.user.orNull);
    const {data: segueEnvironment} = useGetSegueEnvironmentQuery();
    const userNeedsToBeTutorOrTeacher = auth && [isTutorOrAbove.name, isTeacherOrAbove.name].includes(auth.name); // TODO we should try to find a more robust way than this

    if (!isDefined(user)) {
        return <ShowLoading until={user} />;
    }

    if (isTeacherPending(user) && auth.name) {
        return <Navigate to="/verifyemail" />;
    }

    if (user && element && auth(user, segueEnvironment || "")) {
        // TODO remove the as
        return React.isValidElement(element) ? element : typeof element === "function" ? element(user as LoggedInUser) : element;
    }

    if (user && !user.loggedIn && !isTutorOrAbove(user) && userNeedsToBeTutorOrTeacher) {
        persistence.save(KEY.AFTER_AUTH_PATH, location.pathname + location.search);
        return <Navigate to="/login" />;
    }

    if (user && !isTutorOrAbove(user) && userNeedsToBeTutorOrTeacher) {
        return <Navigate to={TEACHER_REQUEST_ROUTE} />;
    }

    if (user && user.loggedIn && !auth(user, segueEnvironment || "")) {
        return <Unauthorised />;
    }

    persistence.save(KEY.AFTER_AUTH_PATH, location.pathname + location.search + location.hash);
    return <Navigate to="/login" />;
};
