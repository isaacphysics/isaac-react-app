import React, {useEffect} from "react";
import {Redirect, Route, RouteComponentProps, RouteProps, useLocation} from "react-router";
import {FigureNumberingContext, PotentialUser} from "../../../IsaacAppTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {selectors, useAppSelector} from "../../state";
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

type TrackedRouteProps = RouteProps & {componentProps?: any} & UserFilterProps;
type TrackedRouteComponentProps = RouteComponentProps & {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
};

const FigureNumberingWrappedComponent = function({component: Component, ...props}: TrackedRouteComponentProps) {
    return <FigureNumberingContext.Provider value={{}}> {/* Create a figure numbering scope for each page */}
        <Component {...props} />
    </FigureNumberingContext.Provider>;
};

export const TrackedRoute = function({component, componentProps, ...rest}: TrackedRouteProps) {
    // Store react-router's location, rather than window's location, during the react render to track changes in history so that we
    // can ensure it handles the location correctly even if there is a react-router <Redirect ...> before the useEffect is called.
    const location = useLocation();
    useEffect(() => {
        // Use window's location for the origin to match trackPageview's normal URL format - react-router does not record origin.
        trackPageview({ url: window.location.origin + location.pathname + location.search + location.hash });
    }, [location.pathname]);

    const user = useAppSelector(selectors.user.orNull);
    if (component) {
        if (rest.ifUser !== undefined) {
            const {ifUser, ...rest$} = rest;
            return <Route {...rest$} render={props => {
                const propsWithUser = {user, ...props};
                const userNeedsToBeTutorOrTeacher = rest.ifUser && [isTutorOrAbove.name, isTeacherOrAbove.name].includes(rest.ifUser.name); // TODO we should try to find a more robust way than this
                return <ShowLoading until={user}>
                    {!isNotPartiallyLoggedIn(user) && ifUser.name ?
                        <Redirect to="/verifyemail"/> :
                        user && ifUser(user) ?
                            <FigureNumberingWrappedComponent component={component} {...propsWithUser} {...componentProps} /> :
                            user && !user.loggedIn && !isTutorOrAbove(user) && userNeedsToBeTutorOrTeacher ?
                                persistence.save(KEY.AFTER_AUTH_PATH, props.location.pathname + props.location.search) && <Redirect to="/login"/>
                                :
                                user && !isTutorOrAbove(user) && userNeedsToBeTutorOrTeacher ?
                                    <Redirect to={TEACHER_REQUEST_ROUTE}/>
                                    :
                                    user && user.loggedIn && !ifUser(user) ?
                                        <Unauthorised/>
                                        :
                                        persistence.save(KEY.AFTER_AUTH_PATH, props.location.pathname + props.location.search + props.location.hash) && <Redirect to="/login"/>
                    }
                </ShowLoading>;
            }}/>;
        } else {
            return <Route {...rest} render={props => {
                return <FigureNumberingWrappedComponent component={component} {...props} {...componentProps} />;
            }}/>;
        }
    } else {
        throw new Error("TrackedRoute only works on components, got: " + JSON.stringify(rest));
    }
};
