import React, {ReactElement} from "react";
import {Tabs} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {useCurrentExamBoard} from "../../services/examBoard";
import {IS_CS_PLATFORM} from "../../services/constants";

interface IsaacTabsProps {
    doc: {children: {title?: string; children?: ContentDTO[]}[]};
}

export const IsaacTabs = (props: any) => {
    const {doc: {children}} = props as IsaacTabsProps;
    const examBoardFilter = useCurrentExamBoard();
    const tabTitlesToContent: {[title: string]: ReactElement} = {};

    let activeTab = 1;
    children.forEach((child, index) => {
        const tabTitle = child.title || `Tab ${index + 1}`;
        if (IS_CS_PLATFORM && examBoardFilter == tabTitle) {
            activeTab = index + 1;
        }
        tabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
    });

    return <Tabs className="isaac-tab" tabContentClass="pt-4" activeTabOverride={activeTab}>
        {tabTitlesToContent}
    </Tabs>;
};
