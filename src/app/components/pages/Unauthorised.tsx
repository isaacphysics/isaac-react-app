import React from "react";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { useTranslation } from "react-i18next";

export const Unauthorised = () => {
    const { t } = useTranslation();
    const {pathname, state} = useLocation();
    return <Container>
        <div>
            <TitleAndBreadcrumb breadcrumbTitleOverride={t("common:auth.unauthorised.breadcrumbTitle")} currentPageTitle={t("common:auth.unauthorised.title")} icon={{type: "icon", icon: "icon-error"}} />
            <div className="my-4 h3">
                {t("common:auth.unauthorised.message")}
            </div>
            <code>
                {(state && state.overridePathname) || pathname}
            </code>
        </div>
    </Container>;
};
