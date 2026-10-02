import {SITE_TITLE} from "../../services";
import React from "react";
import {Button, Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useSessionExpired} from "../../services";
import { Trans, useTranslation } from "react-i18next";

export const ConsistencyError = () => {
    const { t } = useTranslation();

    const [target, clearRenewPath] = useSessionExpired();

    return <Container>
        <TitleAndBreadcrumb breadcrumbTitleOverride="User consistency error" currentPageTitle={t("common:auth.sessionError.title", { siteTitle: SITE_TITLE })} icon={{type: "icon", icon: "icon-error"}} className="mb-4" />
        <p className="pb-2">{t("common:auth.sessionError.message")}</p>
        <p>
            {/* eslint-disable jsx-a11y/anchor-has-content */}<Trans i18nKey="common:auth.sessionError.tip" components={{ strong: <b />, privacyLink: <a href="https://en.wikipedia.org/wiki/Privacy_mode" target="_blank" rel="noopener noreferrer" /> }} />{/* eslint-enable jsx-a11y/anchor-has-content */}
        </p>
        <Button color="secondary" onClick={clearRenewPath} href={target}>{t("common:auth.sessionError.continueButton")}</Button>
    </Container>;
};
