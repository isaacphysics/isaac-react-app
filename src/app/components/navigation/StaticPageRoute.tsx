import {TrackedRoute} from "./TrackedRoute";
import {Generic} from "../pages/Generic";
import React from "react";
import {PotentialUser} from "../../../IsaacAppTypes";
import {RouteProps} from "react-router";
import {Immutable} from "immer";

export interface StaticPageRouteProps {
    pageId?: string;
    ifUser?: (user: Immutable<PotentialUser>) => boolean;
}

/**
 * N.B. This has to look to Switch like a Route (so use path and exact), else it will match when
 * it shouldn't. (Switch disregards JSX parsing rules.)
 */
function StaticPageRoute({pageId, ifUser, ...rest}: StaticPageRouteProps & RouteProps) {
    if (pageId === undefined) {
        if (rest.path === undefined || typeof rest.path !== 'string') {
            throw new Error("Can't get pageId for StaticPageRoute: " + JSON.stringify(rest));
        }
        pageId = rest.path.substr(1);
    }
    return <TrackedRoute {...rest} ifUser={ifUser} component={Generic} componentProps={{pageIdOverride: pageId}} />;
}

export default StaticPageRoute;
