import React, {useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import {withRouter} from "react-router-dom";
import {ALPHABET, DOCUMENT_TYPE, NOT_FOUND} from "../../services/constants";
import {useDispatch, useSelector} from "react-redux";
import {logAction} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {scrollVerticallyIntoView} from "../../services/scrollManager";
import {AccordionSectionContext} from "../../../IsaacAppTypes";
import {selectors} from "../../state/selectors";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {pauseAllVideos} from "../content/IsaacVideo";
import {LaTeX} from "./LaTeX";
import uuid from "uuid";
import {audienceStyle, notRelevantMessage, useUserContext} from "../../services/userContext";
import classNames from "classnames";

interface AccordionsProps {
    id?: string;
    trustedTitle?: string;
    index: number;
    location: {hash: string};
    children?: React.ReactElement;
    startOpen?: boolean;
    deEmphasised?: boolean;
    audienceString?: string;
}

let nextClientId = 0;

export const Accordion = withRouter(({id, trustedTitle, index, children, startOpen, deEmphasised, audienceString, location: {hash}}: AccordionsProps) => {
    const dispatch = useDispatch();
    const userContext = useUserContext();
    const componentId = useRef(uuid.v4().slice(0, 4)).current;
    const page = useSelector((state: AppState) => (state && state.doc) || null);

    // Toggle
    const isFirst = index === 0;
    const openFirst = SITE_SUBJECT === SITE.CS || Boolean(page && page !== NOT_FOUND && page.type === DOCUMENT_TYPE.QUESTION);
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
    const questionsOnPage = useSelector(selectors.questions.getQuestions) || [];
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
                    "justify-content-center " + classNames({[audienceStyle(audienceString)]: SITE_SUBJECT === SITE.CS})}>
                    {audienceString}
                </span>}
                <div className="accordion-title pl-3">
                    <RS.Row>
                        <span className="accordion-part p-3 text-secondary">Part {ALPHABET[index % ALPHABET.length]}  {" "}</span>
                        {trustedTitle && <div className="p-3"><LaTeX markup={trustedTitle} /></div>}
                        {SITE_SUBJECT === SITE.CS  && deEmphasised && <div className="ml-auto mr-3 d-flex align-items-center">
                            <span id={`audience-help-${componentId}`} className="icon-help mx-1" />
                            <RS.UncontrolledTooltip placement="bottom" target={`audience-help-${componentId}`}>
                                {`This content is ${notRelevantMessage(userContext)}.`}
                            </RS.UncontrolledTooltip>
                        </div>}

                    </RS.Row>
                </div>

                {accordionIcon && SITE_SUBJECT === SITE.PHY && <span className={"accordion-icon align-self-center accordion-icon-" + accordionIcon}>
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
