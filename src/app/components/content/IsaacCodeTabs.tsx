import React, {ReactElement, useEffect, useRef, useState} from "react";
import {Tabs} from "../elements/Tabs";
import {CodeSnippetDTO} from "../../../IsaacApiTypes";
import {IsaacCodeSnippet} from "./IsaacCodeSnippet";
import {isDefined} from "../../services/miscUtils";
import {programmingLanguagesMap} from "../../services/constants";
import {useUserContext} from "../../services/userContext";
import {ShowLoading} from "../handlers/ShowLoading";

interface IsaacCodeTabsProps {
    doc: {children: {title?: string; children?: CodeSnippetDTO[]}[]};
}

export const IsaacCodeTabs = (props: any) => {
    const {doc: {children}} = props as IsaacCodeTabsProps;
    const tabTitlesToContent: {[title: string]: ReactElement} = {};
    const {currentProgrammingLanguage} = useUserContext();
    const [defaultTabIndex, setDefaultTabIndex] = useState<number | undefined>(undefined);

    children.forEach((child, index) => {
        const titleFromSnippet = child?.children && child?.children[0].language && programmingLanguagesMap[child.children[0].language.toUpperCase()];
        const tabTitle = titleFromSnippet || child.title || `Tab ${index + 1}`;
        if (isDefined(child.children)) {
            tabTitlesToContent[tabTitle] = <IsaacCodeSnippet doc={child.children[0]} />;
        }
    });

    const tabTitles = Object.keys(tabTitlesToContent);

    useEffect(() => {
        isDefined(currentProgrammingLanguage) && isDefined(tabTitles) && setDefaultTabIndex(tabTitles.indexOf(programmingLanguagesMap[currentProgrammingLanguage]));
    }, [currentProgrammingLanguage, tabTitles]);

    return <Tabs className="isaac-tab" tabContentClass="pt-4" activeTabOverride={defaultTabIndex ? defaultTabIndex + 1 : 1}>
        {tabTitlesToContent}
    </Tabs>;
};
