import React from "react";
import {connect, ConnectedComponentClass} from "react-redux";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacQuestionTabs} from "./IsaacQuestionTabs";
import {ContentDTO} from "../../IsaacApiTypes";

const stateToProps = null;
const dispatchToProps = null;

interface IsaacContentProps {
    doc: ContentDTO
}
const IsaacContentComponent = (props: IsaacContentProps) => {
    const {doc: {type, layout, encoding, value, children}} = props;

    // TODO MT consider moving map to constants
    const contentMap: {[index: string]: React.ComponentType<any>} = {
        // figure: IsaacFigure,
        // image: IsaacImage,
        // video: IsaacVideo,
        // isaacFeaturedProfile: IsaacFeaturedProfile,
        // isaacQuestion: IsaacQuickQuestion,
        // anvilApp: AnvilApp,

        isaacMultiChoiceQuestion: IsaacQuestionTabs,
        // isaacNumericQuestion: IsaacQuestionTabs,
        // isaacSymbolicQuestion: IsaacQuestionTabs,
        // isaacSymbolicChemistryQuestion: IsaacQuestionTabs,
        // isaacSymbolicLogicQuestion: IsaacQuestionTabs,
        // isaacGraphSketcherQuestion: IsaacQuestionTabs,
        // isaacAnvilQuestion: IsaacQuestionTabs,
        // isaacStringMatchQuestion: IsaacQuestionTabs,
        // isaacFreeTextQuestion: IsaacQuestionTabs,
    };
    const layoutMap: {[index: string]: React.ComponentType<any>} = {
        // tabs: IsaacTabs,
        // accordion: IsaacAccordion,
        // horizontal: IsaacHorizontal
    };

    const Component =
        (type && contentMap[type]) ||
        (layout && layoutMap[layout]) ||
        IsaacContentValueOrChildren;

    return <Component {...props} encoding={encoding} value={value} children={children} />;
};

export const IsaacContent = connect(stateToProps, dispatchToProps)(IsaacContentComponent);
