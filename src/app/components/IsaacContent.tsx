import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacQuestionTabs} from "./IsaacQuestionTabs";
import {ContentDTO} from "../../IsaacApiTypes";

interface IsaacContentProps {
    doc: ContentDTO
}
export const IsaacContent = (props: IsaacContentProps) => {
    const {doc: {type, layout, encoding, value, children}} = props;

    let selectedComponent;
    switch (type) {
        // case "figure": selectedComponent = <IsaacFigure {...props} />; break; // TODO
        // case "image": selectedComponent = <IsaacImage {...props} />; break; // TODO
        // case "video": selectedComponent = <IsaacVideo {...props} />; break; // TODO
        // case "isaacFeaturedProfile": selectedComponent = <IsaacFeaturedProfile {...props} />; break; // TODO
        // case "isaacQuestion": selectedComponent = <IsaacQuickQuestion {...props} />; break; // TODO
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
        default:
            switch (layout) {
                // case "tabs": selectedComponent = <IsaacTabs {...props} />; break; // TODO
                // case "accordion": selectedComponent = <IsaacAccordion {...props} />; break; // TODO
                // case "horizontal": selectedComponent = <IsaacHorizontal {...props} />; break; // TODO
                default: selectedComponent =
                    <IsaacContentValueOrChildren encoding={encoding} value={value} children={children} />;
            }
    }
    return selectedComponent;
};
