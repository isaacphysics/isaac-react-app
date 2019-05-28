import React from "react";
import {withRouter} from "react-router-dom";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";

interface PageNotFoundProps {location: {pathname: string; state?: {overridePathname?: string}}}

const PageNotFoundComponent = ({location: {pathname, state}}: PageNotFoundProps) => {
    return <React.Fragment>
        <div>
            <BreadcrumbTrail currentPageTitle="Unknown page" />
            <h1 className="h-title">Page Not Found</h1>
            <h3 className="my-4">
                <small>
                    {"We're sorry, page not found: "}
                    <code>
                        {(state && state.overridePathname) || pathname}
                    </code>
                </small>
            </h3>
        </div>
    </React.Fragment>;
};

export const NotFound = withRouter(PageNotFoundComponent);
