import React, {useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {
    ALPHABET,
    audienceStyle,
    DOCUMENT_TYPE,
    isCS,
    isPhy,
    NOT_FOUND,
    notRelevantMessage,
    scrollVerticallyIntoView,
    useUserContext
} from "../../services";
import {AppState, logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import {AccordionSectionContext} from "../../../IsaacAppTypes";
import {pauseAllVideos} from "../content/IsaacVideo";
import {v4 as uuid_v4} from "uuid";
import classNames from "classnames";
import {Markup} from "./markup";

interface AccordionsProps extends RouteComponentProps {
    id?: string;
    trustedTitle?: string;
    index?: number;
    children?: React.ReactNode;
    startOpen?: boolean;
    deEmphasised?: boolean;
    audienceString?: string;
}

let nextClientId = 0;

export const Accordion = withRouter(({id, trustedTitle, index, children, startOpen, deEmphasised, audienceString, location: {hash}}: AccordionsProps) => {
    const dispatch = useAppDispatch();
    const userContext = useUserContext();
    const componentId = useRef(uuid_v4().slice(0, 4)).current;
    const page = useAppSelector((state: AppState) => (state && state.doc) || null);

    // Toggle
    const isFirst = index === 0;
    const openFirst = isCS || Boolean(page && page !== NOT_FOUND && page.type === DOCUMENT_TYPE.QUESTION);
    const [open, setOpen] = useState(startOpen === undefined ? (openFirst && isFirst) : startOpen);

    // If start open changes we need to update whether or not the accordion section should be open
    useEffect(() => {if (startOpen !== undefined) {setOpen(startOpen);}}, [setOpen, startOpen]);

    // Hash anchoring
    let anchorId: string | null = null;
    if (id) {
        const idParts = id.split("|");
        if (idParts.length > 1) {
            anchorId = idParts[1];
        }
    }

    useEffect(() => {
        if (hash.includes("#")) {
            const hashAnchor = hash.slice(1);
            const element = document.getElementById(hashAnchor);
            if (element) { // exists on page
                if (hashAnchor === anchorId) {
                    scrollVerticallyIntoView(element);
                    setOpen(true);
                } else {
                    setOpen(false);
                }
            }
        }
    }, [hash, anchorId]);

    function logAccordionOpen() {
        if (page && page != NOT_FOUND) {
            let eventDetails;
            if (page.type === "isaacQuestionPage") {
                eventDetails = {
                    type: "QUESTION_PART_OPEN",
                    questionPageId: page.id,
                    questionPartIndex: index,
                    questionPartId: id
                };
            } else if (page.type === "isaacConceptPage") {
                eventDetails = {
                    type: "CONCEPT_SECTION_OPEN",
                    conceptPageId: page.id,
                    conceptSectionIndex: index,
                    conceptSectionLevel: null,
                    conceptSectionId: id
                };
            } else {
                eventDetails = {
                    type: "ACCORDION_SECTION_OPEN",
                    pageId: page.id,
                    accordionId: id,
                    accordionTitle: trustedTitle,
                    accordionIndex: index
                };
            }
            dispatch(logAction(eventDetails));
        }
    }

    // Question result summarization
    const clientId = useRef('c' + nextClientId++);

    // Check results of questions in this accordion
    let accordionIcon;
    const questionsOnPage = useAppSelector(selectors.questions.getQuestions) || [];
    const questionsInsideAccordionSection = questionsOnPage?.filter(q => q.accordionClientId === clientId.current);
    if (questionsInsideAccordionSection.length > 0) {
        let allCorrect = true;
        let allWrong = true;
        let allValidated = true;
        questionsInsideAccordionSection.forEach(question => {
            if (question.validationResponse) {
                const correct = question.validationResponse.correct;
                if (correct) {
                    allWrong = false;
                } else {
                    allCorrect = false;
                }
            } else {
                allValidated = false;
            }
        });
        if (allValidated && allCorrect) accordionIcon = "tick";
        if (allValidated && allWrong) accordionIcon = "cross";
    }

    const isConceptPage = page && page != NOT_FOUND && page.type === DOCUMENT_TYPE.CONCEPT;

    return <div className="accordion">
        <div className="accordion-header">
            <RS.Button
                id={anchorId || ""} block color="link"
                className={"d-flex align-items-stretch " + classNames({"de-emphasised": deEmphasised, "active": open})}
                onClick={(event: any) => {
                    pauseAllVideos();
                    const nextState = !open;
                    setOpen(nextState);
                    if (nextState) {
                        logAccordionOpen();
                        scrollVerticallyIntoView(event.target);
                    }
                }}
                aria-expanded={open ? "true" : "false"}
            >
                {isConceptPage && audienceString && <span className={"stage-label badge-secondary d-flex align-items-center " +
                    "justify-content-center " + classNames({[audienceStyle(audienceString)]: isCS})}>
                    {audienceString}
                </span>}
                <div className="accordion-title pl-3">
                    <RS.Row>
                        {/* FIXME Revisit this maybe? https://github.com/isaacphysics/isaac-react-app/pull/473#discussion_r841556455 */}
                        <span className="accordion-part p-3 text-secondary">Part {ALPHABET[(index as number) % ALPHABET.length]}  {" "}</span>
                        {trustedTitle && <div className="p-3">
                            <Markup encoding={"latex"}>
                                {trustedTitle}
                            </Markup>
                        </div>}
                        {isCS  && deEmphasised && <div className="ml-auto mr-3 d-flex align-items-center">
                            <span id={`audience-help-${componentId}`} className="icon-help mx-1" />
                            <RS.UncontrolledTooltip placement="bottom" target={`audience-help-${componentId}`}>
                                {`This content has ${notRelevantMessage(userContext)}.`}
                            </RS.UncontrolledTooltip>
                        </div>}

                    </RS.Row>
                </div>

                {accordionIcon && isPhy && <span className={"accordion-icon align-self-center accordion-icon-" + accordionIcon}>
                    <span className="sr-only">{accordionIcon == "tick" ? "All questions in this part are answered correctly" : "All questions in this part are answered incorrectly"}</span>
                </span>}
            </RS.Button>
        </div>
        <RS.Collapse isOpen={open} className="mt-1">
            <AccordionSectionContext.Provider value={{id, clientId: clientId.current, open}}>
                <RS.Card>
                    <RS.CardBody>
                        {children}
                    </RS.CardBody>
                </RS.Card>
            </AccordionSectionContext.Provider>
        </RS.Collapse>
    </div>;
});
