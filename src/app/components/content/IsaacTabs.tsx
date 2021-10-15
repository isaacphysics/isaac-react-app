import React, {ReactElement} from "react";
import {Tabs} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";

interface IsaacTabsProps {
    doc: {children: {title?: string; children?: ContentDTO[]}[]};
}

export const IsaacTabs = (props: any) => {
    const {doc: {children}} = props as IsaacTabsProps;
    const tabTitlesToContent: {[title: string]: ReactElement} = {};

    children.forEach((child, index) => {
        const tabTitle = child.title || `Tab ${index + 1}`;
        tabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
    });

    return <Tabs className="isaac-tab" tabContentClass="pt-4">
        {tabTitlesToContent}
    </Tabs>;
};
