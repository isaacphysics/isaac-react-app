import React, {useEffect} from "react";
import {Navigate, Route, RouteProps, useLocation} from "react-router";
import {FigureNumberingContext, PotentialUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {docSlice, selectors, useAppDispatch, useAppSelector} from "../../state";
import {
    isNotPartiallyLoggedIn,
    isTeacherOrAbove,
    isTutorOrAbove,
    KEY,
    persistence,
    TEACHER_REQUEST_ROUTE,
    trackPageview
} from "../../services";
import {Unauthorised} from "../pages/Unauthorised";
import {Immutable} from "immer";

interface UserFilterProps {
    ifUser?: (user: Immutable<PotentialUser>) => boolean;
}

type TrackedRouteProps = RouteProps & UserFilterProps;

const FigureNumberingProvider = ({element}: {element: React.ReactNode}) => {
    return <FigureNumberingContext.Provider value={{}}> {/* Create a figure numbering scope for each page */}
        {element}
    </FigureNumberingContext.Provider>;
};

// support for element, children and component, but element preferred stylistically (https://reactrouter.com/6.30.2/upgrading/v5#advantages-of-route-element)
export const TrackedRoute = function(props: TrackedRouteProps) {
    const {element, children, Component, ifUser, ...rest} = props;
    // Store react-router's location, rather than window's location, during the react render to track changes in history so that we
    // can ensure it handles the location correctly even if there is a react-router <Redirect ...> before the useEffect is called.
    const location = useLocation();
    const dispatch = useAppDispatch();
    useEffect(() => {
        // Use window's location for the origin to match trackPageview's normal URL format - react-router does not record origin.
        trackPageview({ url: window.location.origin + location.pathname + location.search + location.hash });
        dispatch(docSlice.actions.resetPage()); // reset redux's doc after any page change
    }, [location.pathname]);

    const user = useAppSelector(selectors.user.orNull);

    if (children) {
        // children is reserved for nested Routes (https://reactrouter.com/6.30.2/upgrading/v5#advantages-of-route-element). beyond the initial tracking, we do nothing special.
        return <Route {...props} />;
    }

    if (!ifUser) {
        return <Route {...rest} element={
            <FigureNumberingProvider element={element || (Component && <Component />)} />
        } />;
    }

    const userNeedsToBeTutorOrTeacher = ifUser && [isTutorOrAbove.name, isTeacherOrAbove.name].includes(ifUser.name); // TODO we should try to find a more robust way than this

    return <Route {...rest} element={
        <ShowLoading until={user}>
            {!isNotPartiallyLoggedIn(user) && ifUser.name ?
                <Navigate to="/verifyemail" /> :
                user && ifUser(user) ?
                    <FigureNumberingProvider element={element || children} /> :
                    user && !user.loggedIn && !isTutorOrAbove(user) && userNeedsToBeTutorOrTeacher ?
                        persistence.save(KEY.AFTER_AUTH_PATH, location.pathname + location.search) && <Navigate to="/login" />
                        :
                        user && !isTutorOrAbove(user) && userNeedsToBeTutorOrTeacher ?
                            <Navigate to={TEACHER_REQUEST_ROUTE} />
                            :
                            user && user.loggedIn && !ifUser(user) ?
                                <Unauthorised/>
                                :
                                persistence.save(KEY.AFTER_AUTH_PATH, location.pathname + location.search + location.hash) && <Navigate to="/login" />
            }
        </ShowLoading>
    }/>;
};
