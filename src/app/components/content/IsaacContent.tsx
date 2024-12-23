import React, {lazy} from "react";
import {AnvilApp} from "./AnvilApp";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacQuestion} from "./IsaacQuestion";
import {IsaacVideo} from "./IsaacVideo";
import {IsaacImage} from "./IsaacImage";
import {IsaacFigure} from "./IsaacFigure";
import {IsaacGlossaryTerm} from "./IsaacGlossaryTerm";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacQuickQuestion} from "./IsaacQuickQuestion";
import {IsaacTabs} from "./IsaacTabs";
import {IsaacAccordion} from "./IsaacAccordion";
import {IsaacHorizontal} from "./IsaacHorizontal";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {QuestionContext} from "../../../IsaacAppTypes";
import {IsaacFeaturedProfile} from "./IsaacFeaturedProfile";
import {IsaacCard} from "./IsaacCard";
import {IsaacCardDeck} from "./IsaacCardDeck";
import {QuizQuestion} from "./QuizQuestion";
import {isQuestion} from "../../services";
import {IsaacCodeTabs} from "./IsaacCodeTabs";
import {IsaacInteractiveCodeSnippet} from "./IsaacInteractiveCodeSnippet";
import {IsaacCallout} from "./IsaacCallout";
import InlineContextProvider from "../elements/InlineContextProvider";

const IsaacCodeSnippet = lazy(() => import("./IsaacCodeSnippet"));

const classBasedLayouts = {
    left: "align-start",
    right: "align-end",
    righthalf: "align-end-half",
    textleft: "text-start",
    textcentre: "text-center",
    textcentrecolumn: "text-center-column",
    clearfix: "clearfix w-100"
};

export interface IsaacContentProps extends RouteComponentProps {
    doc: ContentDTO,
    contentIndex?: number
}

export const IsaacContent = withRouter((props: IsaacContentProps) => {
    const {doc: {type, layout, encoding, value, children}, match} = props;

    let selectedComponent;
    let tempSelectedComponent;
    if (isQuestion(props.doc)) {
        // FIXME: Someday someone will remove /quiz/ and this comment too.
        if (match.path.startsWith("/quiz/") || match.path.startsWith("/test/")) {
            tempSelectedComponent = <QuizQuestion {...props} />;
        } else {
            tempSelectedComponent = <IsaacQuestion {...props} />;
        }

        if (type === "isaacInlineRegion") {
            tempSelectedComponent = <InlineContextProvider docId={props.doc.id}>{tempSelectedComponent}</InlineContextProvider>;
        }

        selectedComponent = <QuestionContext.Provider value={props.doc.id}>{tempSelectedComponent}</QuestionContext.Provider>;
    } else {
        switch (type) {
            case "figure": selectedComponent = <IsaacFigure {...props} />; break;
            case "image": selectedComponent = <IsaacImage {...props} />; break;
            case "video": selectedComponent = <IsaacVideo {...props} />; break;
            case "codeSnippet": selectedComponent = <IsaacCodeSnippet {...props} />; break;
            case "interactiveCodeSnippet": selectedComponent = <IsaacInteractiveCodeSnippet {...props} />; break;
            case "glossaryTerm": selectedComponent = <IsaacGlossaryTerm {...props} />; break;
            case "isaacFeaturedProfile": selectedComponent = <IsaacFeaturedProfile {...props} />; break;
            case "isaacQuestion": selectedComponent = <IsaacQuickQuestion {...props} />; break;
            case "anvilApp": selectedComponent = <AnvilApp {...props} />; break;
            case "isaacCard": selectedComponent = <IsaacCard {...props} />; break;
            case "isaacCardDeck": selectedComponent = <IsaacCardDeck {...props} />; break;
            case "codeTabs": selectedComponent = <IsaacCodeTabs {...props} />; break;
            default:
                switch (layout) {
                    case "tabs": selectedComponent = <IsaacTabs {...props} />; break;
                    case "callout": selectedComponent = <IsaacCallout {...props} />; break;
                    case "accordion": selectedComponent = <IsaacAccordion {...props} />; break;
                    case "horizontal": selectedComponent = <IsaacHorizontal {...props} />; break;
                    case "clearfix": selectedComponent = <>&nbsp;</>; break;
                    default: selectedComponent =
                        <IsaacContentValueOrChildren encoding={encoding} value={value}>
                            {children}
                        </IsaacContentValueOrChildren>;
                }
        }
    }

    if (layout && classBasedLayouts.hasOwnProperty(layout)) {
        // @ts-ignore because we do the check with hasOwnProperty
        return <div className={classBasedLayouts[layout]}>
            {selectedComponent}
        </div>;
    } else {
        return selectedComponent;
    }
});
