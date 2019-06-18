import React from "react";
import {withRouter} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

interface PageNotFoundProps {location: {pathname: string; state?: {overridePathname?: string}}}

const PageNotFoundComponent = ({location: {pathname, state}}: PageNotFoundProps) => {
    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Unknown page" currentPageTitle="Page Not Found" />
            <h3 className="my-4">
                <small>
                    {"We're sorry, page not found: "}
                    <code>
                        {(state && state.overridePathname) || pathname}
                    </code>
                </small>
            </h3>
        </div>
    </Container>;
};

export const NotFound = withRouter(PageNotFoundComponent);
