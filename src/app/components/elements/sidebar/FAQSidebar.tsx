import React from "react";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";

export const FAQSidebar = (props: ContentSidebarProps) => {
    return <ContentSidebar buttonTitle="Select a topic" {...props}>
        <div className="section-divider mb-3"/>
        <h3 className="mb-3 h5">Select a topic</h3>
        {props.children}
    </ContentSidebar>;
};
