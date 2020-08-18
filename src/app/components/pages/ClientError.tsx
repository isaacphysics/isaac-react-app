import React from "react";
import {Link} from "react-router-dom";
import {Alert, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import ReactGA from "react-ga";
import {WEBMASTER_EMAIL} from "../../services/siteConstants";
import {FallbackProps} from "react-error-boundary";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";

export const ClientError = ({resetErrorBoundary, error, componentStack}: FallbackProps) => {
    const user = useSelector(selectors.user.orNull);
    ReactGA.exception({
        description: 'client_error',
        fatal: true
    });

    const usefulInformation = {
        "User ID": user?.loggedIn && user.id || "Not currently logged in",
        "Location": window.location.href,
        "User Agent": window.navigator.userAgent,
        "Error Details": "\n" + error?.stack || "",
    }
    const plainTextUsefulInformation = "\n\n---- Useful Error Information ----\n\n" + Object.entries(usefulInformation)
        .map(([label, value]) => `${label}: ${value}`).join("\n\n")

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
                        to={`/contact?subject=App Error&message=${encodeURI(plainTextUsefulInformation)}`}
                        onKeyPress={() => resetErrorBoundary()} onClick={() => resetErrorBoundary()}
                    >
                        contact
                    </Link>
                    {" or "}
                    <a href={`mailto:${WEBMASTER_EMAIL}`}>email</a>
                    {" us if this keeps happening."}
                </small>
                <Row className="mt-4 mb-5">
                    <Col>
                        <div className="alert alert-info small overflow-auto">
                            <h4>Useful information to include in your email</h4>
                            <small>
                                {Object.entries(usefulInformation).map(([label, value]) => (
                                    <p><strong>{label}: </strong>{value}</p>
                                ))}
                            </small>
                        </div>
                    </Col>
                </Row>
            </h3>
        </div>
    </Container>;
};
