import React, {ReactElement} from "react";
import {Tabs} from "../elements/Tabs";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
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

    return <Tabs className="isaac-tab" tabContentClass="pt-4">
        {tabTitlesToContent}
    </Tabs>;
};
