import React from "react";
import {Link} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import ReactGA from "react-ga";
import {WEBMASTER_EMAIL} from "../../services/siteConstants";
import {FallbackProps} from "react-error-boundary";

export const ClientError = ({resetErrorBoundary, error, componentStack}: FallbackProps) => {
    ReactGA.exception({
        description: 'client_error',
        fatal: true
    });

    return <Container>
        <div>
            <TitleAndBreadcrumb currentPageTitle="Error" />
            <h3 className="my-4"><small>{"We're sorry, but an error has occurred in the Isaac app!"}</small></h3>
            <h3>
                <small>
                    {"You may want to "}
                    <a
                        role="button"
                        tabIndex={0}
                        href={window.location.href}
                        onKeyPress={() => window.location.reload(true)}
                        onClick={() => window.location.reload(true)}
                    >
                        refresh this page and try again
                    </a>
                    {", "}
                    <Link to="/" onKeyPress={() => resetErrorBoundary()} onClick={() => resetErrorBoundary()}>
                        return to our homepage
                    </Link>
                    {", or "}
                    <Link
                        to={`/contact?subject=Client Error Recorded: ${error?.message || "Error"}`}
                        onKeyPress={() => resetErrorBoundary()} onClick={() => resetErrorBoundary()}
                    >
                        contact
                    </Link>
                    {" or "}
                    <a href={`mailto:${WEBMASTER_EMAIL}`}>email</a>
                    {" us if this keeps happening."}
                </small>
            </h3>
        </div>
    </Container>;
};
