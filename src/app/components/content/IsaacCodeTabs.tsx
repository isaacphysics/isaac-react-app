import React, {ReactElement, useEffect, useState} from "react";
import {Tabs} from "../elements/Tabs";
import {CodeSnippetDTO} from "../../../IsaacApiTypes";
import {isDefined, PROGRAMMING_LANGUAGE, programmingLanguagesMap, useUserPreferences} from "../../services";
import { IsaacContent } from "./IsaacContent";

interface IsaacCodeTabsProps {
    doc: {children: {title?: string; children?: CodeSnippetDTO[]}[]};
}

export const IsaacCodeTabs = (props: any) => {
    const {doc: {children}} = props as IsaacCodeTabsProps;
    const tabTitlesToContent: {[title: string]: ReactElement} = {};
    const {preferredProgrammingLanguage} = useUserPreferences();
    const [defaultTabIndex, setDefaultTabIndex] = useState<number>(-1);

    children.forEach((child, index) => {
        const titleFromSnippet = child?.children && child?.children?.length > 0 && child?.children[0].language && programmingLanguagesMap[child.children[0].language.toUpperCase()];
        const tabTitle = titleFromSnippet || child.title || `Tab ${index + 1}`;
        tabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
    });

    const tabTitles = Object.keys(tabTitlesToContent);

    useEffect(() => {
        if (isDefined(preferredProgrammingLanguage) && isDefined(tabTitles)) {
            const defaultIndex = (preferredProgrammingLanguage === PROGRAMMING_LANGUAGE.VBA && tabTitles.includes("VB")) ? tabTitles.indexOf("VB") : tabTitles.indexOf(programmingLanguagesMap[preferredProgrammingLanguage]);
            setDefaultTabIndex(defaultIndex);
        }
    }, [preferredProgrammingLanguage, tabTitles]);

    return <Tabs className="isaac-tab card card-body border bg-white pb-2 mb-4" tabContentClass="pt-4" activeTabOverride={defaultTabIndex !== -1 ? defaultTabIndex + 1 : 1}>
        {tabTitlesToContent}
    </Tabs>;
};
