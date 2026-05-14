import React, {ReactElement, useEffect, useState} from "react";
import {Tabs, TabStyle} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {isAda, isDefined, isPhy} from "../../services";
import classNames from "classnames";
import { useTranslation } from 'react-i18next'

interface IsaacTabsProps {
    doc: {
        children: {title?: string; children?: ContentDTO[]}[],
        expandable?: boolean
    };
    style?: TabStyle;
}

type IsaacTabChildren = {[title: string]: ReactElement};

export const isTabs = (layout?: string) => {
    return layout && layout.startsWith("tabs/") ? layout : false;
};

export const IsaacTabs = (props: any) => {
    const { t } = useTranslation()
    const { doc: { children: tabs, expandable}, style } = props as IsaacTabsProps;
    const [ tabTitlesToContent , setTabTitlesToContent ] = useState<IsaacTabChildren>({});

    useEffect(() => {
        if (!isDefined(tabs)) return;

        const newTabTitlesToContent: IsaacTabChildren = {};
        tabs.forEach((child, index) => {
            const tabTitle = child.title || t('tab.tab', 'Tab') + ` ${index + 1}`;
            newTabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
        });
        setTabTitlesToContent(newTabTitlesToContent);
    }, [tabs]);

    const adaCardClasses = "card card-body border bg-white pb-2 mb-4";
    return <Tabs className={classNames("isaac-tab", {[adaCardClasses]: isAda})} tabContentClass={(style === "dropdowns" || (isPhy && !style)) ? "pt-2" : "pt-4"} expandable={expandable} style={style}>
        {tabTitlesToContent}
    </Tabs>;
};
