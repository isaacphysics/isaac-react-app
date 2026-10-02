import React from "react";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {siteSpecific, WEBMASTER_EMAIL} from "../../services";
import { Trans, useTranslation } from "react-i18next";

const buildContactUrl = (state: {overridePathname?: string}, pathname: string) => {
    const page = encodeURIComponent((state && state.overridePathname) || pathname);
    return `/contact?preset=notFound&page=${page}`;
};

export const NotFound = () => {
    const { t } = useTranslation();
    const {pathname, state} = useLocation();
    return <Container>
        <div className="pb-1">
            <TitleAndBreadcrumb
                breadcrumbTitleOverride={siteSpecific("Unknown page", "404")}
                currentPageTitle={window.navigator.onLine ? t("common:clientError.notFound.title") : t("common:clientError.notFound.offlineTitle")}
                icon={{type: "icon", icon: "icon-error"}}
            />
            <p className="my-4">
                <Trans i18nKey="common:clientError.notFound.message" components={{ code: <code /> }} values={{ pathname: (state && state.overridePathname) || pathname }} />
            </p>

            {window.navigator.onLine ?
                <p>
                    {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:clientError.notFound.reportPrompt" components={{ contactAction: <a className="ps-1" href={buildContactUrl(state, pathname)} />, srOnly: <span className="visually-hidden" /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}
                </p> :
                <p>
                    {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:clientError.notFound.offlineMessage" components={{ br: <br />, webmasterEmail: <a href={`mailto:${WEBMASTER_EMAIL}`} /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}
                </p> // Email link rather than contact form, as the contact form may not work offline
            }
        </div>
    </Container>;
};
