import React from "react";
import {withRouter} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

interface UnauthorisedProps {location: {pathname: string; state?: {overridePathname?: string}}}

const UnauthorisedComponent = ({location: {pathname, state}}: UnauthorisedProps) => {
    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Unauthorised" currentPageTitle="Access denied" />
            <h3 className="my-4">
                <small>
                    {"You do not have authorisation to access the page: "}
                    <code>
                        {(state && state.overridePathname) || pathname}
                    </code>
                </small>
            </h3>
        </div>
    </Container>;
};

export const Unauthorised = withRouter(UnauthorisedComponent);
