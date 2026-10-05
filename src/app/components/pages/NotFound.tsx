import React from "react";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {siteSpecific, WEBMASTER_EMAIL} from "../../services";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../elements/TransAnchor";

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
                    <Trans
                        i18nKey="common:clientError.notFound.reportPrompt"
                        components={{
                            contactAction: <TransAnchor className="ps-1" href={buildContactUrl(state, pathname)} />,
                            srOnly: <span className="visually-hidden" />,
                        }}
                    />
                </p> :
                <p>
                    <Trans
                        i18nKey="common:clientError.notFound.offlineMessage"
                        components={{
                            br: <br />,
                            webmasterEmail: <TransAnchor href={`mailto:${WEBMASTER_EMAIL}`} />,
                        }}
                    />
                </p> // Email link rather than contact form, as the contact form may not work offline
            }
        </div>
    </Container>;
};
