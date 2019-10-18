import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacQuestionTabs} from "./IsaacQuestionTabs";
import {IsaacVideo} from "./IsaacVideo";
import {IsaacImage} from "./IsaacImage";
import {IsaacFigure} from "./IsaacFigure";
import {IsaacGlossaryTerm} from "./IsaacGlossaryTerm";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacQuickQuestion} from "./IsaacQuickQuestion";
import {IsaacTabs} from "./IsaacTabs";
import {IsaacAccordion} from "./IsaacAccordion";
import {IsaacHorizontal} from "./IsaacHorizontal";
import {withRouter} from "react-router-dom";
import {IsaacQuizTabs} from "./IsaacQuizTabs";

interface IsaacContentProps {
    doc: ContentDTO;
    match: {path: string};
}
export const IsaacContent = withRouter((props: IsaacContentProps) => {
    const {doc: {type, layout, encoding, value, children}, match} = props;

    let selectedComponent;
    switch (type) {
        case "figure": selectedComponent = <IsaacFigure {...props} />; break;
        case "image": selectedComponent = <IsaacImage {...props} />; break;
        case "video": selectedComponent = <IsaacVideo {...props} />; break;
        case "glossaryTerm": selectedComponent = <IsaacGlossaryTerm {...props} />; break;
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
        case "isaacItemQuestion":
        case "isaacParsonsQuestion":
            if (match.path.startsWith("/quizzes")) {
                selectedComponent = <IsaacQuizTabs {...props} />;
            } else {
                selectedComponent = <IsaacQuestionTabs {...props} />;
            }
            break;
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
});
