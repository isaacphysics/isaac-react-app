import React, {ReactElement, useMemo, useState} from "react";
import {Tabs} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {EXAM_BOARD} from "../../services/constants";
import {determineCurrentExamBoard} from "../../services/examBoard";

const stateToProps = (state: AppState) => ({
    user: state && state.user,
    currentExamBoardPreference: state && state.currentExamBoardPreference
});

interface IsaacTabsProps {
    doc: {
        children: {
            title?: string;
            children?: ContentDTO[];
        }[];
    };
    user: LoggedInUser | null;
    currentExamBoardPreference: EXAM_BOARD | null;
}

const IsaacTabsComponent = (props: any) => {
    const {doc: {children}, user, currentExamBoardPreference} = props as IsaacTabsProps;
    const [examBoardFilter, setExamBoardFilter] = useState(determineCurrentExamBoard(user, currentExamBoardPreference));
    useMemo(() => {
        setExamBoardFilter(determineCurrentExamBoard(user, currentExamBoardPreference));
    }, [user]);
    const tabTitlesToContent: {[title: string]: ReactElement} = {};
    let activeTab = 1;
    children.forEach((child, index) => {
        const tabTitle = child.title || `Tab ${index + 1}`;
        if (examBoardFilter == tabTitle) {
            activeTab = index + 1;
        }

        tabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
    });

    return <Tabs className="isaac-tab" tabContentClass="pt-4" activeTabOverride={activeTab}>
        {tabTitlesToContent}
    </Tabs>;
};

export const IsaacTabs = withRouter(connect(stateToProps)(IsaacTabsComponent));
