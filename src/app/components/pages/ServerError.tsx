import React, { useEffect } from "react";
import {Link} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE_SHORT, trackEvent, WEBMASTER_EMAIL} from "../../services";
import { useTranslation } from 'react-i18next'

export const ServerError = () => {
    const { t } = useTranslation()
    useEffect(() => {
        trackEvent("exception", { props: { description: `server_error`, fatal: true } });
    }, []);

    return <Container>
        <div>
            <TitleAndBreadcrumb currentPageTitle="Error" icon={{type: "icon", icon: "icon-error"}} />

            <h3 className="my-4">{t('wereSorryButAnErrorHasOccurredOnTheSite_title_shortServer', 'We\'re sorry, but an error has occurred on the {{SITE_TITLE_SHORT}} server!', { SITE_TITLE_SHORT })}</h3>

            <p>
                {t('youMayWantTo', 'You may want to ')}
                <a
                    role="button"
                    tabIndex={0}
                    href={window.location.href}
                    onKeyPress={() => window.location.reload()}
                    onClick={() => window.location.reload()}
                >
                    {t('refreshThisPageAndTryAgain', 'refresh this page and try again')}
                </a>
                {", "}
                <Link to="/">
                    {t('returnToOurHomepage', 'return to our homepage')}
                </Link>
                {t('or2', ', or ')}
                <Link to="/contact">
                    contact
                </Link>
                {t('or3', ' or ')}
                <a href={`mailto:${WEBMASTER_EMAIL}`}>email</a>
                {t('usIfThisKeepsHappening', ' us if this keeps happening.')}
            </p>
        </div>
    </Container>;
};
