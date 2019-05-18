import React from "react";
import {withRouter} from "react-router-dom";

interface PageNotFoundProps {readonly location: {readonly pathname: string}}

const PageNotFoundComponent = ({location: {pathname}}: PageNotFoundProps) => {
    return <React.Fragment>
        <div>
            <h2>Page Not Found</h2>
            <p>Page not found: {pathname}</p>
        </div>
    </React.Fragment>;
};

export const PageNotFound = withRouter(PageNotFoundComponent);
