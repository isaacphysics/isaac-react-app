import React, {ReactElement} from "react";
import {Tabs} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {useCurrentExamBoard} from "../../services/examBoard";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {Card} from "reactstrap";

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
        if (SITE_SUBJECT === SITE.CS && examBoardFilter == tabTitle) {
            activeTab = index + 1;
        }
        tabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
    });

    return <Card>
        <Tabs className="isaac-tab" tabContentClass="pt-4" activeTabOverride={activeTab}>
            {tabTitlesToContent}
        </Tabs>
    </Card>;
};
