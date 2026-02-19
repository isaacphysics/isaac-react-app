import React, { useEffect } from "react";
import {Link} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE_SHORT, trackEvent, WEBMASTER_EMAIL} from "../../services";

export const ServerError = () => {
    useEffect(() => {
        trackEvent("exception", { props: { description: `server_error`, fatal: true } });
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb currentPageTitle="Error" icon={{type: "icon", icon: "icon-error"}} />

            <h3 className="my-4">{`We're sorry, but an error has occurred on the ${SITE_TITLE_SHORT} server!`}</h3>

            <p>
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
            </p>
        </div>
    </Container>;
};
