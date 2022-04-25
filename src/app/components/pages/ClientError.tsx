import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import ReactGA from "react-ga";
import {WEBMASTER_EMAIL} from "../../services/siteConstants";
import {FallbackProps} from "react-error-boundary";
import {useDispatch, useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {logAction} from "../../state/actions";

export const ClientError = ({resetErrorBoundary, error}: FallbackProps) => {
    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    ReactGA.exception({
        description: `client_error: ${error?.message || 'unknown'}`,
        fatal: true
    });
    const usefulInformation = {
        userId: user?.loggedIn && user.id || "Not currently logged in",
        location: window.location.href,
        userAgent: window.navigator.userAgent,
        errorDetails: "\n" + error?.stack || "",
    }
    const usefulInformationLabels: {[k in keyof typeof usefulInformation]: string} = {
        userId: "User ID",
        location: "Location",
        userAgent: "User Agent",
        errorDetails: "Error Details",
    }

    useEffect(() => {
        const {userId, ...informationNotIncludingUserId} = usefulInformation;
        dispatch(logAction({...informationNotIncludingUserId, type: "CLIENT_SIDE_ERROR"}));
    }, []);

    const plainTextUsefulInformation = "\n\n---- Useful Error Information ----\n\n" + Object.entries(usefulInformation)
        .map(([key, value]) => `${usefulInformationLabels[key as keyof typeof usefulInformation]}: ${value}`).join("\n\n")

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
                        onKeyPress={() => window.location.reload()}
                        onClick={() => window.location.reload()}
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
                                {Object.entries(usefulInformation).map(([key, value]) => (
                                    <p key={key}><strong>{usefulInformationLabels[key as keyof typeof usefulInformation]}: </strong>{value}</p>
                                ))}
                            </small>
                        </div>
                    </Col>
                </Row>
            </h3>
        </div>
    </Container>;
};
