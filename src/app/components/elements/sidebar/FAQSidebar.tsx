import React from "react";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";

export const FAQSidebar = (props: ContentSidebarProps) => {
    return <ContentSidebar buttonTitle="Select a topic" {...props}>
        <div className="section-divider mb-3"/>
        <h5 className="mb-3">Select a topic</h5>
        {props.children}
    </ContentSidebar>;
};