import React, { useEffect } from "react";
import {Link} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE_SHORT, trackEvent, WEBMASTER_EMAIL} from "../../services";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../elements/TransAnchor";

export const ServerError = () => {
    const { t } = useTranslation();
    useEffect(() => {
        trackEvent("exception", { props: { description: `server_error`, fatal: true } });
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb currentPageTitle={t("common:serverError.title")} icon={{type: "icon", icon: "icon-error"}} />

            <div className="my-4 h3">{t("common:serverError.heading", { siteTitle: SITE_TITLE_SHORT })}</div>

            <p>
                <Trans
                    i18nKey="common:serverError.suggestions"
                    components={{
                        refresh: <TransAnchor role="button" tabIndex={0} href={window.location.href} onKeyPress={() => window.location.reload()} onClick={() => window.location.reload()} />,
                        homepage: <Link to="/" />,
                        contact: <Link to="/contact" />,
                        email: <TransAnchor href={`mailto:${WEBMASTER_EMAIL}`} />,
                    }}
                />
            </p>
        </div>
    </Container>;
};
