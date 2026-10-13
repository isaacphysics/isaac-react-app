import React from "react";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { useTranslation } from "react-i18next";

export const FAQSidebar = (props: ContentSidebarProps) => {
    const { t } = useTranslation();
    return <ContentSidebar buttonTitle={t("common:support.sidebar.selectTopicButton")} {...props}>
        <div className="section-divider mb-3"/>
        <h3 className="mb-3 h5">{t("common:support.sidebar.selectTopicTitle")}</h3>
        {props.children}
    </ContentSidebar>;
};
