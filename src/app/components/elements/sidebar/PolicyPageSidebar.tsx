import React from "react";
import { useLocation, useNavigate } from "react-router";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";

export const PolicyPageSidebar = (props: ContentSidebarProps) => {
    const navigate = useNavigate();
    const path = useLocation().pathname;

    return <ContentSidebar buttonTitle="Select a page" optionBar={props.optionBar}>
        <div className="section-divider"/>
        <h5>Select a page</h5>
        <ul>
            <li><StyledTabPicker checkboxTitle="Accessibility Statement" checked={path === "/accessibility" || path === "/pages/accessibility_statement"} onChange={() => navigate("/accessibility")}/></li>
            <li><StyledTabPicker checkboxTitle="Privacy Policy" checked={path === "/privacy"  || path === "/pages/privacy_policy"} onChange={() => navigate("/privacy")}/></li>
            <li><StyledTabPicker checkboxTitle="Cookie Policy" checked={path === "/cookies" || path === "/pages/cookie_policy"} onChange={() => navigate("/cookies")}/></li>
            <li><StyledTabPicker checkboxTitle="Terms of Use" checked={path === "/terms" || path === "/pages/terms_of_use"} onChange={() => navigate("/terms")}/></li>
        </ul>
    </ContentSidebar>;
};
