import React from "react";
import { Link } from "react-router-dom";
import { AffixButton } from "../AffixButton";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";

export const GenericPageSidebar = (props: ContentSidebarProps) => {
    // Default sidebar for general pages that don't have a custom sidebar
    return <ContentSidebar buttonTitle="Options" hideButton optionBar={props.optionBar}>
        <div className="section-divider"/>
        <AffixButton color="keyline" tag={Link} to={"/"} affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}>
            Go to homepage
        </AffixButton>
    </ContentSidebar>;
};