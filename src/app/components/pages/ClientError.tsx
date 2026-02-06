import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE_SHORT, trackEvent, WEBMASTER_EMAIL} from "../../services";
import {FallbackProps} from "react-error-boundary";
import {logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import {Loading} from "../handlers/IsaacSpinner";

export const ChunkOrClientError = ({resetErrorBoundary, error}: FallbackProps) => {
    const isChunkError = error.name === "ChunkLoadError";
    useEffect(() => {
        if (isChunkError) location.reload();
    }, [isChunkError]);
    return isChunkError ? <Loading/> : <ClientError error={error} resetErrorBoundary={resetErrorBoundary}/>;
};

export const ClientError = ({resetErrorBoundary, error}: FallbackProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);

    useEffect(() => {
        trackEvent("exception", { props: { description: `client_error: ${error?.message || 'unknown'}`, fatal: true } });
    }, [error]);

    const usefulInformation = {
        userId: user?.loggedIn && user.id || "Not currently logged in",
        location: window.location.href,
        userAgent: window.navigator.userAgent,
        errorMessage: "\n" + (error?.message || ""),
    };
    const usefulInformationLabels: {[k in keyof typeof usefulInformation]: string} = {
        userId: "User ID",
        location: "Location",
        userAgent: "User Agent",
        errorMessage: "Error Details",
    };

    useEffect(() => {
        const {userId, ...informationNotIncludingUserId} = usefulInformation;
        dispatch(logAction({...informationNotIncludingUserId, type: "CLIENT_SIDE_ERROR"}));
    }, []);

    const plainTextUsefulInformation = "\n\n---- Useful Error Information ----\n\n" + Object.entries(usefulInformation)
        .map(([key, value]) => `${usefulInformationLabels[key as keyof typeof usefulInformation]}: ${value}`).join("\n\n");

    return <Container>
        <div>
            <TitleAndBreadcrumb currentPageTitle="Error" icon={{type: "icon", icon: "icon-error"}}/>
            <h3 className="my-4">{`We're sorry, but an error has occurred in the ${SITE_TITLE_SHORT} app!`}</h3>
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
                <Link to="/" onKeyPress={() => resetErrorBoundary()} onClick={() => resetErrorBoundary()}>
                    return to our homepage
                </Link>
                {", or "}
                <Link
                    to={`/contact?subject=App Error&message=${encodeURIComponent(plainTextUsefulInformation)}`}
                    onKeyPress={() => resetErrorBoundary()} onClick={() => resetErrorBoundary()}
                >
                    contact
                </Link>
                {" or "}
                <a href={`mailto:${WEBMASTER_EMAIL}`}>email</a>
                {" us if this keeps happening."}
            </p>

            <Row className="mt-4 mb-7">
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
        </div>
    </Container>;
};
