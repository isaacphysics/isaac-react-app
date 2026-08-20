import React from "react";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";

export const FAQSidebar = (props: ContentSidebarProps) => {
    return <ContentSidebar buttonTitle="Select a topic" {...props}>
        <div className="section-divider mb-3"/>
        <div className="mb-3 h5">Select a topic</div>
        {props.children}
    </ContentSidebar>;
};
