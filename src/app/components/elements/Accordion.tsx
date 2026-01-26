import React, {useEffect, useMemo, useRef} from "react";
import {useLocation} from "react-router-dom";
import {
    above,
    ALPHABET,
    audienceStyle,
    calculateQuestionSetCompletionState,
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
import {logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
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
import { Spacer } from "./Spacer";
import { CompletionState } from "../../../IsaacApiTypes";
import { StatusDisplay } from "./list-groups/AbstractListViewItem";
import { LLMFreeTextQuestionIndicator } from "./LLMFreeTextQuestionIndicator";
import { useHistoryState } from "../../state/actions/history";

interface AccordionsProps {
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

export const Accordion = ({id, trustedTitle, index, children, startOpen, deEmphasised, disabled, audienceString}: AccordionsProps) => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const componentId = useRef(uuid_v4().slice(0, 4)).current;
    const page = useAppSelector(selectors.doc.get);

    const deviceSize = useDeviceSize();

    const isReducedMotion = useReducedMotion();

    const isFirst = index === 0;
    const openFirst = isAda || Boolean(page && page !== NOT_FOUND && page.type === DOCUMENT_TYPE.QUESTION);
    const [open, setOpen, loadedFromHistory] = useHistoryState<boolean>(
        `accordion-${id ?? "unknown"}-${index ?? "unknown"}`,
        disabled 
            ? false 
            : startOpen ?? (openFirst && isFirst)
    );
    
    // If start open changes we need to update whether or not the accordion section should be open
    useEffect(() => {
        if (startOpen !== undefined && !loadedFromHistory) {
            setOpen(startOpen);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startOpen, setOpen]);

    // Hash anchoring
    let anchorId: string | null = null;
    if (id) {
        const idParts = id.split("|");
        if (idParts.length > 1) {
            anchorId = idParts[1];
        }
    }

    useEffect(() => {
        if (location.hash.includes("#")) {
            const hashAnchor = location.hash.slice(1);
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
    }, [location.hash, anchorId, setOpen]);

    function getPage() {
        if (page && page != NOT_FOUND) {
            return page;
        }
        return null;
    }

    const debouncedLogAccordion = useMemo(() =>
        debounce((eventDetails) =>
            dispatch(logAction(eventDetails)), 200, {leading: true, trailing: false}), [dispatch]);

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
            debouncedLogAccordion(eventDetails);
        }
    }

    // Question result summarization
    const clientId = useRef('c' + nextClientId++);

    // Check results of questions in this accordion
    const questionsOnPage = useAppSelector(selectors.questions.getQuestions) || [];
    const questionsInsideAccordionSection = questionsOnPage?.filter(q => q.accordionClientId === clientId.current);
    
    const accordionState = calculateQuestionSetCompletionState(questionsInsideAccordionSection);
    const accordionAltText = {
        [CompletionState.ALL_CORRECT]: "All questions in this part are answered correctly.",
        [CompletionState.ALL_INCORRECT]: "All questions in this part are answered incorrectly.",
        [CompletionState.ALL_ATTEMPTED]: "Some questions in this part are answered incorrectly.",
        [CompletionState.IN_PROGRESS]: "Some questions in this part are answered incorrectly.",
        [CompletionState.NOT_ATTEMPTED]: "No questions in this part have been answered."
    };

    const accordionQuestionIncludeLLMMarked = questionsInsideAccordionSection?.some(q => q.type === "isaacLLMFreeTextQuestion");
    const allQuestionsOnPageLLMMarked = questionsOnPage?.every(q => q.type === "isaacLLMFreeTextQuestion");
    const includeLLMMarkedQuestionIndicator = accordionQuestionIncludeLLMMarked && !allQuestionsOnPageLLMMarked;

    const isConceptPage = page && page != NOT_FOUND && page.type === DOCUMENT_TYPE.CONCEPT;

    const isOpen = open && !disabled;

    return <div className="isaac-accordion">
        <button 
            className={classNames(
                "accordion-header d-flex w-100 p-0", 
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
            {isConceptPage && audienceString && isAda && <span className={
                classNames("stage-label d-flex align-self-stretch align-items-center p-2 justify-content-center ", audienceStyle(audienceString))
            }>
                {(above["sm"](deviceSize) 
                    ? audienceString 
                    : audienceString.replaceAll(",", "\n")
                ).split("\n").map(
                    (line, i, arr) => <>
                        {line}{i < arr.length && <br/>}
                    </>
                )}
            </span>}
            <div className={classNames("d-flex flex-grow-1", siteSpecific(`flex-column ps-3 ${isConceptPage && audienceString ? "pt-1" : "pt-3"}`, "align-items-center ps-1"))}>
                {isDefined(index) && <span className={classNames("accordion-part text-theme text-nowrap", siteSpecific("ps-1", "p-3"))}>Part {ALPHABET[index % ALPHABET.length]}  {" "}</span>}
                <div className={classNames("accordion-title p-3 ps-1", {"pt-0": isPhy, "d-flex align-items-center": isPhy && includeLLMMarkedQuestionIndicator})}>
                    {isConceptPage && audienceString && isPhy && <span className="inline-stage-label">{audienceString}<br/></span>}
                    <Markup encoding={"latex"}>
                        {trustedTitle || (isAda ? "" : (isDefined(index) ? `(${ALPHABET[index % ALPHABET.length].toLowerCase()})` : "Untitled"))}
                    </Markup>
                    {includeLLMMarkedQuestionIndicator && <LLMFreeTextQuestionIndicator symbol={deviceSize === "xs"} className="ms-2"/>}
                    {isPhy && <i className={classNames("icon icon-chevron-right icon-dropdown-90 icon-color-black mx-2", {"active": isOpen})}/>}
                </div>
                {typeof disabled === "string" && disabled.length > 0 && <div className={"p-3"}>
                    <span id={`disabled-tooltip-${componentId}`} className={classNames("ms-2 icon icon-info icon-inline-sm", siteSpecific("icon-color-grey", "icon-color-black"))} />
                    <UncontrolledTooltip placement="right" target={`disabled-tooltip-${componentId}`}
                        modifiers={[preventOverflow]}>
                        {disabled}
                    </UncontrolledTooltip>
                </div>}
            </div>

            {accordionState && isPhy && <span className={"accordion-icon d-flex align-items-center gap-2 w-max-content pe-3 align-self-center"}>
                <StatusDisplay status={accordionState} showText className="flex-row-reverse" aria-label={accordionAltText[accordionState]} />
            </span>}
            {isAda && <>
                <Spacer />
                {<i className={classNames("icon icon-chevron-right icon-dropdown-90 me-3", {"active": isOpen})}/>}
            </>}
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
};
