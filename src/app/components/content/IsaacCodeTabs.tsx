import React, {lazy, ReactElement, useEffect, useState} from "react";
import {Tabs} from "../elements/Tabs";
import {CodeSnippetDTO} from "../../../IsaacApiTypes";
import {isDefined} from "../../services/miscUtils";
import {programmingLanguagesMap} from "../../services/constants";
import {useUserContext} from "../../services/userContext";
const IsaacCodeSnippet = lazy(() => import("./IsaacCodeSnippet"));

interface IsaacCodeTabsProps {
    doc: {children: {title?: string; children?: CodeSnippetDTO[]}[]};
}

export const IsaacCodeTabs = (props: any) => {
    const {doc: {children}} = props as IsaacCodeTabsProps;
    const tabTitlesToContent: {[title: string]: ReactElement} = {};
    const {preferredProgrammingLanguage} = useUserContext();
    const [defaultTabIndex, setDefaultTabIndex] = useState<number>(-1);

    children.forEach((child, index) => {
        const titleFromSnippet = child?.children && child?.children?.length > 0 && child?.children[0].language && programmingLanguagesMap[child.children[0].language.toUpperCase()];
        const tabTitle = titleFromSnippet || child.title || `Tab ${index + 1}`;
        if (isDefined(child.children)) {
            tabTitlesToContent[tabTitle] = <IsaacCodeSnippet doc={child.children[0]} />;
        }
    });

    const tabTitles = Object.keys(tabTitlesToContent);

    useEffect(() => {
        if (isDefined(preferredProgrammingLanguage) && isDefined(tabTitles)) {
            setDefaultTabIndex(tabTitles.indexOf(programmingLanguagesMap[preferredProgrammingLanguage]));
        }
    }, [preferredProgrammingLanguage, tabTitles]);

    return <Tabs className="isaac-tab" tabContentClass="pt-4" activeTabOverride={defaultTabIndex !== -1 ? defaultTabIndex + 1 : 1}>
        {tabTitlesToContent}
    </Tabs>;
};
