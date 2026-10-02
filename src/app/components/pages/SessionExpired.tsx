import React, { useEffect } from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {trackEvent, WEBMASTER_EMAIL} from "../../services";
import { Trans, useTranslation } from "react-i18next";

export const SessionExpired = () => {
    const { t } = useTranslation();
    useEffect(() => {
        trackEvent("exception", { props: { description: `session_expired`, fatal: true } });
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride="Session expired error" currentPageTitle={t("common:clientError.sessionExpired.title")} icon={{type: "icon", icon: "icon-error"}}/>

            <h3 className="my-4">{t("common:clientError.sessionExpired.heading")}</h3>

            <p>
                {"You should "}
                <a
                    role="button"
                    tabIndex={0}
                    href={window.location.href}
                    onKeyPress={() => window.location.reload()}
                    onClick={() => window.location.reload()}
                >
                    refresh this page and try again
                </a>
                {", or try refreshing whilst "}
                <a href="https://en.wikipedia.org/wiki/Wikipedia:Bypass_your_cache#Bypassing_cache" target="_blank" rel="noopener noreferrer">
                    {"bypassing your browser's cache"}
                </a>
                {", which may have saved an outdated version of Isaac."}
            </p>
            <p>
                {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:clientError.sessionExpired.contactSupport" components={{ mailtoLink: <a href={`mailto:${WEBMASTER_EMAIL}`} /> }} values={{ webmasterEmail: WEBMASTER_EMAIL }} />{/* eslint-enable jsx-a11y/anchor-has-content */}
            </p>
        </div>
    </Container>;
};
