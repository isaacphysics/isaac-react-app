import React, {useEffect} from "react";
import {Link} from "react-router-dom";
import {Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE_SHORT, trackEvent, WEBMASTER_EMAIL} from "../../services";
import {FallbackProps} from "react-error-boundary";
import {logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import {Loading} from "../handlers/IsaacSpinner";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../elements/TransAnchor";

export const ChunkOrClientError = ({resetErrorBoundary, error}: FallbackProps) => {
    const isChunkOrStaleImportError = error.name === "ChunkLoadError"
        || error.message.includes('Failed to fetch dynamically imported module') // chrome
        || error.message.includes('error loading dynamically imported module')   // firefox
        || error.message.includes('Importing a module script failed');           // safari

    useEffect(() => {
        if (isChunkOrStaleImportError) location.reload();
    }, [isChunkOrStaleImportError]);

    return isChunkOrStaleImportError ? <Loading/> : <ClientError error={error} resetErrorBoundary={resetErrorBoundary}/>;
};

export const ClientError = ({resetErrorBoundary, error}: FallbackProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);

    useEffect(() => {
        trackEvent("exception", { props: { description: `client_error: ${error?.message || 'unknown'}`, fatal: true } });
    }, [error]);

    const usefulInformation = {
        userId: user?.loggedIn && user.id || t("common:clientError.userInfo.notLoggedIn"),
        location: window.location.href,
        userAgent: window.navigator.userAgent,
        errorMessage: "\n" + (error?.message || ""),
    };
    const usefulInformationLabels: {[k in keyof typeof usefulInformation]: string} = {
        userId: t("common:clientError.userInfo.userId"),
        location: t("common:clientError.userInfo.locationLabel"),
        userAgent: t("common:clientError.userInfo.userAgent"),
        errorMessage: t("common:clientError.userInfo.errorDetails"),
    };

    useEffect(() => {
        const {userId, ...informationNotIncludingUserId} = usefulInformation;
        dispatch(logAction({...informationNotIncludingUserId, type: "CLIENT_SIDE_ERROR"}));
    }, []);

    const plainTextUsefulInformation = "\n\n---- Useful Error Information ----\n\n" + Object.entries(usefulInformation)
        .map(([key, value]) => `${usefulInformationLabels[key as keyof typeof usefulInformation]}: ${value}`).join("\n\n");

    return <Container>
        <div>
            <TitleAndBreadcrumb currentPageTitle={t("common:clientError.title")} icon={{type: "icon", icon: "icon-error"}}/>
            <h2 className="my-4 h3">{t("common:clientError.heading", { siteName: SITE_TITLE_SHORT })}</h2>
            <p>
                <Trans
                    i18nKey="common:clientError.recoveryOptions"
                    components={{
                        refreshLink: <TransAnchor role="button" tabIndex={0} href={window.location.href} onKeyPress={() => window.location.reload()} onClick={() => window.location.reload()} />,
                        homeLink: <Link to="/" onKeyPress={() => resetErrorBoundary()} onClick={() => resetErrorBoundary()} />,
                        contactLink: <Link to={`/contact?subject=App Error&message=${encodeURIComponent(plainTextUsefulInformation)}`} onKeyPress={() => resetErrorBoundary()} onClick={() => resetErrorBoundary()} />,
                        emailLink: <TransAnchor href={`mailto:${WEBMASTER_EMAIL}`} />,
                    }}
                />
            </p>

            <Row className="mt-4 mb-7">
                <Col>
                    <div className="alert alert-info small overflow-auto">
                        <div className="h4">{t("common:clientError.userInfo.sectionTitle")}</div>
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
