import React, {useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {
    above,
    ALPHABET,
    audienceStyle,
    DOCUMENT_TYPE,
    isAda,
    isAQuestionLikeDoc,
    isDefined,
    isPhy,
    NOT_FOUND,
    scrollVerticallyIntoView,
    siteSpecific,
    useDeviceSize,
} from "../../services";
import {AppState, logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import {AccordionSectionContext} from "../../../IsaacAppTypes";
import {pauseAllVideos} from "../content/IsaacVideo";
import {v4 as uuid_v4} from "uuid";
import classNames from "classnames";
import {Markup} from "./markup";
import {ReportAccordionButton} from "./ReportAccordionButton";
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow.js';
import debounce from "lodash/debounce";
import { UncontrolledTooltip, Collapse, Card, CardBody } from "reactstrap";
import { useReducedMotion } from "../../services/accessibility";

interface AccordionsProps extends RouteComponentProps {
    id?: string;
    trustedTitle?: string;
    index?: number;
    children?: React.ReactNode;
    startOpen?: boolean;
    deEmphasised?: boolean;
    disabled?: string | boolean;
    audienceString?: string;
}

let nextClientId = 0;

export const Accordion = withRouter(({id, trustedTitle, index, children, startOpen, deEmphasised, disabled, audienceString, location: {hash}}: AccordionsProps) => {
    const dispatch = useAppDispatch();
    const componentId = useRef(uuid_v4().slice(0, 4)).current;
    const page = useAppSelector((state: AppState) => (state && state.doc) || null);

    const deviceSize = useDeviceSize();

    const isReducedMotion = useReducedMotion();

    // Toggle
    const isFirst = index === 0;
    const openFirst = isAda || Boolean(page && page !== NOT_FOUND && page.type === DOCUMENT_TYPE.QUESTION);
    const [open, setOpen] = useState(disabled ? false : (startOpen === undefined ? (openFirst && isFirst) : startOpen));

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

    function getPage() {
        if (page && page != NOT_FOUND) {
            return page;
        }
        return null;
    }

    function logAccordionOpen() {
        const currentPage = getPage();
        if (currentPage) {
            let eventDetails : any;
            if (isAQuestionLikeDoc(currentPage)) {
                eventDetails = {
                    type: "QUESTION_PART_OPEN",
                    questionPageId: currentPage.id,
                    questionPartIndex: index,
                    questionPartId: id
                };
            } else if (currentPage.type === DOCUMENT_TYPE.CONCEPT) {
                eventDetails = {
                    type: "CONCEPT_SECTION_OPEN",
                    conceptPageId: currentPage.id,
                    conceptSectionIndex: index,
                    conceptSectionLevel: null,
                    conceptSectionId: id
                };
            } else {
                eventDetails = {
                    type: "ACCORDION_SECTION_OPEN",
                    pageId: currentPage.id,
                    accordionId: id,
                    accordionTitle: trustedTitle,
                    accordionIndex: index
                };
            }
            debounce(() => dispatch(logAction(eventDetails)), 200, {leading: true, trailing: false});
        }
    }

    // Question result summarization
    const clientId = useRef('c' + nextClientId++);

    // Check results of questions in this accordion
    let accordionState : "correct" | "incorrect" | "in-progress" | undefined;
    const questionsOnPage = useAppSelector(selectors.questions.getQuestions) || [];
    const questionsInsideAccordionSection = questionsOnPage?.filter(q => q.accordionClientId === clientId.current);
    if (questionsInsideAccordionSection.length > 0) {
        let allCorrect = true;
        let allWrong = true;
        let allValidated = true;
        let anyValidated = false;
        questionsInsideAccordionSection.forEach(question => {
            if (question.validationResponse) {
                const correct = question.validationResponse.correct;
                if (correct) {
                    allWrong = false;
                } else {
                    allCorrect = false;
                }
                anyValidated = true;
            } else {
                allValidated = false;
            }
        });
        if (allValidated && allCorrect) accordionState = "correct";
        if (allValidated && allWrong) accordionState = "incorrect";
        if (anyValidated && !accordionState) accordionState = "in-progress";
    }

    const isConceptPage = page && page != NOT_FOUND && page.type === DOCUMENT_TYPE.CONCEPT;

    const isOpen = open && !disabled;

    return <div className="accordion">
        <button 
            className={classNames(
                "accordion-header d-flex w-100 p-0 align-items-stretch", 
                {"de-emphasised": deEmphasised || disabled, "active": isOpen, "btn btn-link": isAda}
            )}
            id={anchorId || ""} type="button"
            tabIndex={disabled ? -1 : 0}
            onFocus={(e) => {
                if (disabled) {
                    e.target.blur();
                }
            }}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                if (disabled) {
                    return;
                }
                pauseAllVideos();
                const nextState = !isOpen;
                setOpen(nextState);
                if (nextState) {
                    logAccordionOpen();
                    if (!isReducedMotion) {
                        scrollVerticallyIntoView(event.target as HTMLElement, -50);
                    }
                }
            }}
            aria-expanded={isOpen ? "true" : "false"}
        >
            {isConceptPage && audienceString && <span className={
                classNames("stage-label d-flex align-items-center p-2 justify-content-center ", {[audienceStyle(audienceString)]: isAda, "bg-theme text-white": isPhy})
            }>
                {siteSpecific(
                    audienceString,
                    above["sm"](deviceSize) ? audienceString : audienceString.replaceAll(",", "\n")
                ).split("\n").map(
                    (line, i, arr) => <>
                        {line}{i < arr.length && <br/>}
                    </>
                )}
            </span>}
            <div className={classNames("d-flex flex-grow-1", siteSpecific("flex-column ps-3 pt-3", "align-items-center ps-1"))}>
                {isDefined(index) && <span className={classNames("accordion-part text-theme text-nowrap", siteSpecific("ps-1", "ps-3 py-3"))}>Part {ALPHABET[index % ALPHABET.length]}  {" "}</span>}
                <div className={classNames("accordion-title p-3", siteSpecific("pt-0 ps-1", "ps-3"))}>
                    <Markup encoding={"latex"}>
                        {trustedTitle || (isAda ? "" : (isDefined(index) ? `(${ALPHABET[index % ALPHABET.length].toLowerCase()})` : "Untitled"))}
                    </Markup>
                </div>
                {typeof disabled === "string" && disabled.length > 0 && <div className={"p-3"}>
                    <span id={`disabled-tooltip-${componentId}`} className="icon-help" />
                    <UncontrolledTooltip placement="right" target={`disabled-tooltip-${componentId}`}
                        modifiers={[preventOverflow]}>
                        {disabled}
                    </UncontrolledTooltip>
                </div>}
            </div>

            {accordionState && isPhy && <span className={"accordion-icon d-flex align-items-center gap-2 w-max-content h-100 pb-1 pe-3 align-self-center"}>
                {accordionState === "correct"
                    ? <>
                        <span>Correct</span>
                        <div className="icon-correct"/>
                        <span className="visually-hidden">All questions in this part are answered correctly.</span>
                    </>
                    : accordionState === "incorrect" 
                        ? <>
                            <span>Incorrect</span>
                            <div className="icon-incorrect"/>
                            <span className="visually-hidden">All questions in this part are answered incorrectly.</span>
                        </>
                        : <>
                            <span>In progress</span>
                            <div className="icon-in-progress"/>
                            <span className="visually-hidden">Some questions in this part are answered incorrectly.</span>
                        </>
                }
            </span>}
        </button>
        <Collapse isOpen={isOpen} className={siteSpecific("accordion-body", "mt-1")}>
            <AccordionSectionContext.Provider value={{id, clientId: clientId.current, open: isOpen}}>
                <Card>
                    <CardBody>
                        {children}
                    </CardBody>
                    <ReportAccordionButton pageId={getPage()?.id} sectionId={id} sectionTitle={trustedTitle}/>
                </Card>
            </AccordionSectionContext.Provider>
        </Collapse>
    </div>;
});
