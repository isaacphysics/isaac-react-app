import React, {ReactElement, useEffect, useState} from "react";
import {Tabs} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import classNames from "classnames";
import {isDefined} from "../../services/miscUtils";

interface IsaacTabsProps {
    doc: {children: {title?: string; children?: ContentDTO[]}[]};
}

type IsaacTabChildren = {[title: string]: ReactElement};

export const IsaacTabs = (props: any) => {
    const { doc: { children: tabs } } = props as IsaacTabsProps;
    const [ tabTitlesToContent , setTabTitlesToContent ] = useState<IsaacTabChildren>({});

    useEffect(() => {
        if (!isDefined(tabs)) return;

        const newTabTitlesToContent: IsaacTabChildren = {};
        tabs.forEach((child, index) => {
            const tabTitle = child.title || `Tab ${index + 1}`;
            newTabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
        });
        setTabTitlesToContent(newTabTitlesToContent);
    }, [tabs]);

    return <Tabs className={classNames("isaac-tab", {"parsons-layout": SITE_SUBJECT === SITE.CS})} tabContentClass="pt-4">
        {tabTitlesToContent}
    </Tabs>;
};
