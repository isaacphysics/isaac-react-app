import React, {ReactElement, useEffect, useState} from "react";
import {Tabs} from "../elements/Tabs";
import { CodeSnippetDTO, ContentDTO } from "../../../IsaacApiTypes";
import {isDefined, programmingLanguagesMap, useUserPreferences} from "../../services";
import { IsaacContent } from "./IsaacContent";

interface IsaacCodeTabsProps {
    doc: {children: {title?: string; children?: ContentDTO[]}[]};
}

export const IsaacCodeTabs = (props: any) => {
    const {doc: {children}} = props as IsaacCodeTabsProps;
    const tabTitlesToContent: {[title: string]: ReactElement} = {};
    const {preferredProgrammingLanguage} = useUserPreferences();
    const [defaultTabIndex, setDefaultTabIndex] = useState<number>(-1);

    children.forEach((child, index) => {
        const codeSnippetChildren: CodeSnippetDTO[] = child.children && child.children?.filter(c => c.type === "codeSnippet") || [];
        const titleFromSnippet = codeSnippetChildren.length > 0 && codeSnippetChildren[0].language && programmingLanguagesMap[codeSnippetChildren[0].language.toUpperCase()];
        const tabTitle = titleFromSnippet || child.title || `Tab ${index + 1}`;
        tabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
    });

    const tabTitles = Object.keys(tabTitlesToContent);

    useEffect(() => {
        if (isDefined(preferredProgrammingLanguage) && isDefined(tabTitles)) {
            setDefaultTabIndex(tabTitles.indexOf(programmingLanguagesMap[preferredProgrammingLanguage]));
        }
    }, [preferredProgrammingLanguage, tabTitles]);

    return <Tabs className="isaac-tab card card-body border bg-white pb-2 mb-4" tabContentClass="pt-4" activeTabOverride={defaultTabIndex !== -1 ? defaultTabIndex + 1 : 1}>
        {tabTitlesToContent}
    </Tabs>;
};
