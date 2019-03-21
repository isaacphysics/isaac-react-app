import React from "react";
import {connect} from "react-redux";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacQuestionTabs} from "./IsaacQuestionTabs";

const stateToProps = null;
const dispatchToProps = null;

const IsaacContentContainer = (props: any) => {
    const {doc: {type, layout, encoding, value, children}} = props;

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
    const container: any = contentMap[type] || layoutMap[layout] || IsaacContentValueOrChildren;
    return React.createElement(container, {...props, encoding, value, children});
};

export const IsaacContent = connect(stateToProps, dispatchToProps)(IsaacContentContainer);
