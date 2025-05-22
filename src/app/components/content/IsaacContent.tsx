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
    const keyedProps = {...props, key: props.doc.id};
    {/* 
        Each IsaacContent is assumed to be independent, not sharing state with any other.
        However, React will reuse components if they are the same type, have the same key (or undefined), and exist in the same place in the DOM.
        If two components A and B meet these criteria, if you switch from component A to component B, any e.g. useStates in B will not
        initialise as expected, but will retain stale data from A.

        This is a problem for any structure where one of several <IsaacContent>s are displayed, e.g. quiz sections, tabs, ... .

        To avoid this, we set the key of each <IsaacContent> to its content ID.
    */}

    let selectedComponent;
    let tempSelectedComponent;
    if (isQuestion(props.doc)) {
        // FIXME: Someday someone will remove /quiz/ and this comment too.
        if (match.path.startsWith("/quiz/") || match.path.startsWith("/test/")) {
            tempSelectedComponent = <QuizQuestion {...keyedProps} />;
        } else {
            tempSelectedComponent = <IsaacQuestion {...keyedProps} />;
        }

        if (type === "isaacInlineRegion") {
            tempSelectedComponent = <InlineContextProvider docId={props.doc.id}>{tempSelectedComponent}</InlineContextProvider>;
        }

        selectedComponent = <QuestionContext.Provider value={props.doc.id}>{tempSelectedComponent}</QuestionContext.Provider>;
    } else {
        switch (type) {
            case "figure": selectedComponent = <IsaacFigure {...keyedProps} />; break;
            case "image": selectedComponent = <IsaacImage {...keyedProps} />; break;
            case "video": selectedComponent = <IsaacVideo {...keyedProps} />; break;
            case "codeSnippet": selectedComponent = <IsaacCodeSnippet {...keyedProps} />; break;
            case "interactiveCodeSnippet": selectedComponent = <IsaacInteractiveCodeSnippet {...keyedProps} />; break;
            case "glossaryTerm": selectedComponent = <IsaacGlossaryTerm {...keyedProps} />; break;
            case "isaacFeaturedProfile": selectedComponent = <IsaacFeaturedProfile {...keyedProps} />; break;
            case "isaacQuestion": selectedComponent = <IsaacQuickQuestion {...keyedProps} />; break;
            case "anvilApp": selectedComponent = <AnvilApp {...keyedProps} />; break;
            case "isaacCard": selectedComponent = <IsaacCard {...keyedProps} />; break;
            case "isaacCardDeck": selectedComponent = <IsaacCardDeck {...keyedProps} />; break;
            case "codeTabs": selectedComponent = <IsaacCodeTabs {...keyedProps} />; break;
            default:
                switch (layout) {
                    case "tabs": selectedComponent = <IsaacTabs {...keyedProps} />; break;
                    case "callout": selectedComponent = <IsaacCallout {...keyedProps} />; break;
                    case "accordion": selectedComponent = <IsaacAccordion {...keyedProps} />; break;
                    case "horizontal": selectedComponent = <IsaacHorizontal {...keyedProps} />; break;
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
