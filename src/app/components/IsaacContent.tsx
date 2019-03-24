import React from "react";
import {connect} from "react-redux";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacQuestionTabs} from "./IsaacQuestionTabs";

const stateToProps = null;
const dispatchToProps = null;

const IsaacContentContainer = (props: any) => {
    const {doc: {type, layout, encoding, value, children}} = props;

    // TODO MT consider moving map to constants
    const contentMap: any = {
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
    const layoutMap: any = {
        // tabs: IsaacTabs,
        // accordion: IsaacAccordion,
        // horizontal: IsaacHorizontal
    };
    const Component: any = contentMap[type] || layoutMap[layout] || IsaacContentValueOrChildren;
    return <Component {...props} encoding={encoding} value={value} children={children} />;
};

export const IsaacContent = connect(stateToProps, dispatchToProps)(IsaacContentContainer);
