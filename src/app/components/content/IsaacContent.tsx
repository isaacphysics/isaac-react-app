import React, {lazy, Suspense} from "react";
import {AnvilApp} from "./AnvilApp";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacQuestion} from "./IsaacQuestion";
import {IsaacVideo} from "./IsaacVideo";
import {IsaacImage} from "./IsaacImage";
import {IsaacFigure} from "./IsaacFigure";
import {IsaacGlossaryTerm} from "./IsaacGlossaryTerm";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacQuickQuestion} from "./IsaacQuickQuestion";
import {IsaacTabs, isTabs} from "./IsaacTabs";
import {IsaacAccordion} from "./IsaacAccordion";
import {IsaacHorizontal} from "./IsaacHorizontal";
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
import { useLocation } from "react-router";
import { DesmosEmbedding } from "./DesmosEmbedding";
import { GeogebraEmbedding } from "./GeogebraEmbedding";

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

export interface IsaacContentProps {
    doc: ContentDTO,
    contentIndex?: number
}

export const IsaacContent = (props: IsaacContentProps) => {
    const {doc: {type, layout, encoding, value, children}} = props;
    const location = useLocation();
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
        if (location.pathname?.startsWith("/quiz/") || location.pathname?.startsWith("/test/")) {
            tempSelectedComponent = <QuizQuestion {...props} key={props.doc.id} />;
        } else {
            tempSelectedComponent = <IsaacQuestion {...props} key={props.doc.id} />;
        }

        if (type === "isaacInlineRegion") {
            tempSelectedComponent = <InlineContextProvider docId={props.doc.id}>{tempSelectedComponent}</InlineContextProvider>;
        }

        selectedComponent = <QuestionContext.Provider value={props.doc.id}>{tempSelectedComponent}</QuestionContext.Provider>;
    } else {
        switch (type) {
            case "figure": selectedComponent = <IsaacFigure {...props} key={props.doc.id} />; break;
            case "image": selectedComponent = <IsaacImage {...props} key={props.doc.id} />; break;
            case "video": selectedComponent = <IsaacVideo {...props} key={props.doc.id} />; break;
            // IsaacCodeSnippet is lazy loaded, so wrap it in Suspense to prevent reload errors
            case "codeSnippet": selectedComponent = <Suspense fallback={<div>Loading...</div>}> <IsaacCodeSnippet {...props} key={props.doc.id} /> </Suspense>; break;
            case "interactiveCodeSnippet": selectedComponent = <IsaacInteractiveCodeSnippet {...props} key={props.doc.id} />; break;
            case "glossaryTerm": selectedComponent = <IsaacGlossaryTerm {...props} key={props.doc.id} />; break;
            case "isaacFeaturedProfile": selectedComponent = <IsaacFeaturedProfile {...props} key={props.doc.id} />; break;
            case "isaacQuestion": selectedComponent = <IsaacQuickQuestion {...props} key={props.doc.id} />; break;
            case "anvilApp": selectedComponent = <AnvilApp {...props} key={props.doc.id} />; break;
            case "desmosEmbedding": selectedComponent = <DesmosEmbedding {...props} key={props.doc.id} />; break;
            case "geogebraEmbedding": selectedComponent = <GeogebraEmbedding {...props} key={props.doc.id} />; break;
            case "isaacCard": selectedComponent = <IsaacCard {...props} key={props.doc.id} />; break;
            case "isaacCardDeck": selectedComponent = <IsaacCardDeck {...props} key={props.doc.id} />; break;
            case "codeTabs": selectedComponent = <IsaacCodeTabs {...props} key={props.doc.id} />; break;
            default:
                switch (layout) {
                    case "tabs": selectedComponent = <IsaacTabs {...props} key={props.doc.id} />; break;
                    case isTabs(layout): selectedComponent = <IsaacTabs {...props} key={props.doc.id} style={layout?.split('/')[1]} />; break;
                    case "callout": selectedComponent = <IsaacCallout {...props} key={props.doc.id} />; break;
                    case "accordion": selectedComponent = <IsaacAccordion {...props} key={props.doc.id} />; break;
                    case "horizontal": selectedComponent = <IsaacHorizontal {...props} key={props.doc.id} />; break;
                    case "clearfix": selectedComponent = <>&nbsp;</>; break;
                    default: selectedComponent =
                        <IsaacContentValueOrChildren encoding={encoding} value={value} key={props.doc.id} >
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
};
