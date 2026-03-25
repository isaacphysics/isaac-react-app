import React from "react";
import { ContentSidebar, ContentSidebarProps } from "../layout/SidebarLayout";
import { AffixButton } from "../AffixButton";
import { Link } from "react-router-dom";

export const NewsSidebar = (props: ContentSidebarProps) => {
    return <ContentSidebar buttonTitle="Options" hideButton optionBar={props.optionBar}>
        <div className="section-divider"/>
        <AffixButton color="keyline" tag={Link} to={"/news"} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
            See all news
        </AffixButton>
    </ContentSidebar>;
};
