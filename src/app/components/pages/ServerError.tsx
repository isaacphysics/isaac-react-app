import React from "react";
import {Link} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import ReactGA from "react-ga";
import ReactGA4 from "react-ga4";
import {WEBMASTER_EMAIL} from "../../services";

export const ServerError = () => {

    ReactGA.exception({
        description: 'server_error',
        fatal: true
    });
    ReactGA4.gtag("event", "exception", {
        description: 'server_error',
        fatal: true
    });

    return <Container>
        <div>
            <TitleAndBreadcrumb currentPageTitle="Error" />

            <h3 className="my-4"><small>{"We're sorry, but an error has occurred on the Isaac server!"}</small></h3>

            <h3>
                <small>
                    {"You may want to "}
                    <a
                        role="button"
                        tabIndex={0}
                        href={window.location.href}
                        onKeyPress={() => window.location.reload()}
                        onClick={() => window.location.reload()}
                    >
                        refresh this page and try again
                    </a>
                    {", "}
                    <Link to="/">
                        return to our homepage
                    </Link>
                    {", or "}
                    <Link to="/contact">
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
