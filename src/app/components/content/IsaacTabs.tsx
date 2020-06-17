import React, {ReactElement} from "react";
import {Tabs} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {useCurrentExamBoard} from "../../services/examBoard";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {useDispatch} from "react-redux";
import {closeActiveModal, openActiveModal} from '../../state/actions';

interface IsaacTabsProps {
    doc: {children: {title?: string; children?: ContentDTO[]}[]};
}

export const IsaacTabs = (props: any) => {
    const {doc: {children}} = props as IsaacTabsProps;
    const tabTitlesToContent: {[title: string]: ReactElement} = {};

    const dispatch = useDispatch();

    function expandToModal(content: any) {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal())},
            title: '',
            body: content
        }))
    }

    children.forEach((child, index) => {
        const tabTitle = child.title || `Tab ${index + 1}`;
        tabTitlesToContent[tabTitle] = <IsaacContent doc={child} />;
    });

    // EXAM BOARD Special Case
    const examBoardFilter = useCurrentExamBoard();
    const tabTitles = Object.keys(tabTitlesToContent);
    const specialCaseExamBoardTab = tabTitles.includes("AQA") && tabTitles.includes("OCR") && tabTitles.length === 2;
    if (SITE_SUBJECT === SITE.CS && specialCaseExamBoardTab) {
        return <div className="examboard-special-tabs">
            <button className="expand-button" onClick={() => expandToModal(tabTitlesToContent[examBoardFilter])}>+</button>
            {tabTitlesToContent[examBoardFilter]}
        </div>;
    }

    // Normal case
    return <Tabs className="isaac-tab" tabContentClass="pt-4">
        {tabTitlesToContent}
    </Tabs>;
};
