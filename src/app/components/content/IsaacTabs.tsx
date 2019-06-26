import React, {ReactElement, useMemo, useState} from "react";
import {Tabs} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {UserPreferencesDTO} from "../../../IsaacAppTypes";
import {EXAM_BOARD} from "../../services/constants";

const stateToProps = (state: AppState) => ({
    userPreferences: state ? state.userPreferences : null
});

interface IsaacTabsProps {
    doc: {
        children: {
            title?: string;
            children?: ContentDTO[];
        }[];
    };
    userPreferences: UserPreferencesDTO | null;
}

const IsaacTabsComponent = (props: any) => {
    const {doc: {children}, userPreferences} = props as IsaacTabsProps;
    const [examBoardFilter, setExamBoardFilter] = useState(userPreferences && userPreferences.EXAM_BOARD && userPreferences.EXAM_BOARD.AQA ? EXAM_BOARD.AQA : EXAM_BOARD.OCR);
    useMemo(() => {
        setExamBoardFilter(userPreferences && userPreferences.EXAM_BOARD && userPreferences.EXAM_BOARD.AQA ? EXAM_BOARD.AQA : EXAM_BOARD.OCR);
    }, [userPreferences]);
    const tabTitlesToContent: {[title: string]: ReactElement} = {};
    let activeTab = 1;
    children.forEach((child, index) => {
        const tabTitle = child.title || `Tab ${index + 1}`;
        if (examBoardFilter == tabTitle) {
            activeTab = index + 1;
        }

        tabTitlesToContent[tabTitle] = <React.Fragment>
            {child.children && child.children.map((tabContentChild, index) => (
                <IsaacContent key={index} doc={tabContentChild} />
            ))}
        </React.Fragment>;
    });

    return <Tabs className="isaac-tab" tabContentClass="pt-4" activeTabOverride={activeTab}>
        {tabTitlesToContent}
    </Tabs>;
};

export const IsaacTabs = withRouter(connect(stateToProps)(IsaacTabsComponent));
