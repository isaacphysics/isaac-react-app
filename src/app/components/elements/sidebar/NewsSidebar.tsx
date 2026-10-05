import React from "react";
import { ContentSidebar, ContentSidebarProps } from "../layout/SidebarLayout";
import { AffixButton } from "../AffixButton";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const NewsSidebar = (props: ContentSidebarProps) => {
    const { t } = useTranslation();
    return <ContentSidebar buttonTitle={t("common:sidebar.optionsButton")} hideButton optionBar={props.optionBar}>
        <div className="section-divider"/>
        <AffixButton color="keyline" tag={Link} to={"/news"} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
            {t("common:news.sidebar.seeAllNews")}
        </AffixButton>
    </ContentSidebar>;
};
