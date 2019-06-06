import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacQuestionTabs} from "./IsaacQuestionTabs";
import {IsaacVideo} from "./IsaacVideo";
import {IsaacImage} from "./IsaacImage";
import {IsaacFigure} from "./IsaacFigure";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacQuickQuestion} from "./IsaacQuickQuestion";
import {IsaacTabs} from "./IsaacTabs";
import {IsaacAccordion} from "./IsaacAccordion";
import {IsaacHorizontal} from "./IsaacHorizontal";

interface IsaacContentProps {
    doc: ContentDTO;
}
export const IsaacContent = (props: IsaacContentProps) => {
    const {doc: {type, layout, encoding, value, children}} = props;

    let selectedComponent;
    switch (type) {
        case "figure": selectedComponent = <IsaacFigure {...props} />; break;
        case "image": selectedComponent = <IsaacImage {...props} />; break;
        case "video": selectedComponent = <IsaacVideo {...props} />; break;
        // case "isaacFeaturedProfile": selectedComponent = <IsaacFeaturedProfile {...props} />; break; // TODO
        case "isaacQuestion": selectedComponent = <IsaacQuickQuestion {...props} />; break;
        // case "anvilApp": selectedComponent = <AnvilApp {...props} />; break; // TODO
        case "isaacMultiChoiceQuestion":
        case "isaacNumericQuestion":
        case "isaacSymbolicQuestion":
        case "isaacSymbolicChemistryQuestion":
        case "isaacSymbolicLogicQuestion":
        case "isaacGraphSketcherQuestion":
        case "isaacAnvilQuestion":
        case "isaacStringMatchQuestion":
        case "isaacFreeTextQuestion":
            selectedComponent = <IsaacQuestionTabs {...props} />; break;
        case "isaacParsonsQuestion":
            selectedComponent = <IsaacQuestionTabs {...props} large />; break;
        default:
            switch (layout) {
                case "tabs": selectedComponent = <IsaacTabs {...props} />; break;
                case "accordion": selectedComponent = <IsaacAccordion {...props} />; break;
                case "horizontal": selectedComponent = <IsaacHorizontal {...props} />; break;
                default: selectedComponent =
                    <IsaacContentValueOrChildren encoding={encoding} value={value}>
                        {children}
                    </IsaacContentValueOrChildren>;
            }
    }
    return selectedComponent;
};
