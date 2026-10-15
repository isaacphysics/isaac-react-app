import React, { useEffect } from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {trackEvent, WEBMASTER_EMAIL} from "../../services";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../elements/TransAnchor";

export const SessionExpired = () => {
    const { t } = useTranslation();
    useEffect(() => {
        trackEvent("exception", { props: { description: `session_expired`, fatal: true } });
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride={t("common:clientError.sessionExpired.breadcrumbTitle")} currentPageTitle={t("common:clientError.sessionExpired.title")} icon={{type: "icon", icon: "icon-error"}}/>

            <div className="my-4 h3">{t("common:clientError.sessionExpired.heading")}</div>

            <p>
                <Trans
                    i18nKey="common:clientError.sessionExpired.retryInstructions"
                    components={{
                        refresh: <TransAnchor role="button" tabIndex={0} href={window.location.href} onKeyPress={() => window.location.reload()} onClick={() => window.location.reload()} />,
                        bypassCache: <TransAnchor href="https://en.wikipedia.org/wiki/Wikipedia:Bypass_your_cache#Bypassing_cache" target="_blank" rel="noopener noreferrer" />,
                    }}
                />
            </p>
            <p>
                <Trans
                    i18nKey="common:clientError.sessionExpired.contactSupport"
                    components={{
                        mailtoLink: <TransAnchor href={`mailto:${WEBMASTER_EMAIL}`} />,
                    }}
                    values={{ webmasterEmail: WEBMASTER_EMAIL }}
                />
            </p>
        </div>
    </Container>;
};
