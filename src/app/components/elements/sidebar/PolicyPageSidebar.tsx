import React from "react";
import { useLocation, useNavigate } from "react-router";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { useTranslation } from "react-i18next";

export const PolicyPageSidebar = (props: ContentSidebarProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const path = useLocation().pathname;

    return <ContentSidebar buttonTitle={t("common:policy.sidebar.selectPage")} optionBar={props.optionBar}>
        <div className="section-divider"/>
        <h3 className="h5">{t("common:policy.sidebar.selectPage")}</h3>
        <ul>
            <li><StyledTabPicker checkboxTitle={t("common:policy.sidebar.accessibilityStatement")} checked={path === "/accessibility" || path === "/pages/accessibility_statement"} onChange={() => navigate("/accessibility")}/></li>
            <li><StyledTabPicker checkboxTitle={t("common:policy.sidebar.privacyPolicy")} checked={path === "/privacy"  || path === "/pages/privacy_policy"} onChange={() => navigate("/privacy")}/></li>
            <li><StyledTabPicker checkboxTitle={t("common:policy.sidebar.cookiePolicy")} checked={path === "/cookies" || path === "/pages/cookie_policy"} onChange={() => navigate("/cookies")}/></li>
            <li><StyledTabPicker checkboxTitle={t("common:policy.sidebar.termsOfUse")} checked={path === "/terms" || path === "/pages/terms_of_use"} onChange={() => navigate("/terms")}/></li>
        </ul>
    </ContentSidebar>;
};
