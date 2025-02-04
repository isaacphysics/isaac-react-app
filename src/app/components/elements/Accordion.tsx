import React, {useEffect, useRef, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {
    above,
    ALPHABET,
    audienceStyle,
    DOCUMENT_TYPE,
    isAda,
    isAQuestionLikeDoc,
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
import { Button, Row, UncontrolledTooltip, Collapse, Card, CardBody } from "reactstrap";

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

    const isOpen = open && !disabled;

    return <div className="accordion">
        <div className={classNames({"active-border": isPhy && !page && isOpen})}> {/* don't apply accordion borders on content pages yet */}
            <div className="accordion-header">
                <Button
                    id={anchorId || ""} block color="link"
                    tabIndex={disabled ? -1 : 0}
                    onFocus={(e) => {
                        if (disabled) {
                            e.target.blur();
                        }
                    }}
                    className={"d-flex align-items-stretch " + classNames({"de-emphasised": deEmphasised || disabled, "active": isOpen, "up-chevron": isPhy && isOpen})}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        if (disabled) {
                            return;
                        }
                        pauseAllVideos();
                        const nextState = !isOpen;
                        setOpen(nextState);
                        if (nextState) {
                            logAccordionOpen();
                            scrollVerticallyIntoView(event.target as HTMLElement);
                        }
                    }}
                    aria-expanded={isOpen ? "true" : "false"}
                >
                    {isConceptPage && audienceString && <span className={
                        classNames("stage-label d-flex align-items-center p-2 justify-content-center ", {[audienceStyle(audienceString)]: isAda, "text-bg-theme": isPhy})
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
                    <div className="accordion-title ps-3">
                        <Row className="h-100">
                            <div className="d-flex align-items-center p-0 h-100">
                                {/* FIXME Revisit this maybe? https://github.com/isaacphysics/isaac-react-app/pull/473#discussion_r841556455 */}
                                <span className="accordion-part p-3 text-theme text-nowrap">Part {ALPHABET[(index as number) % ALPHABET.length]}  {" "}</span>
                                {trustedTitle && <div className="p-3">
                                    <h2>
                                        <Markup encoding={"latex"}>
                                            {trustedTitle}
                                        </Markup>
                                    </h2>
                                </div>}
                                {typeof disabled === "string" && disabled.length > 0 && <div className={"p-3"}>
                                    <span id={`disabled-tooltip-${componentId}`} className="icon-help" />
                                    <UncontrolledTooltip placement="right" target={`disabled-tooltip-${componentId}`}
                                        modifiers={[preventOverflow]}>
                                        {disabled}
                                    </UncontrolledTooltip>
                                </div>}
                            </div>
                        </Row>
                    </div>

                    {accordionIcon && isPhy && <span className={"accordion-icon align-self-center accordion-icon-" + accordionIcon}>
                        <span className="visually-hidden">{accordionIcon == "tick" ? "All questions in this part are answered correctly" : "All questions in this part are answered incorrectly"}</span>
                    </span>}
                </Button>
            </div>
            <Collapse isOpen={isOpen} className="mt-1">
                <AccordionSectionContext.Provider value={{id, clientId: clientId.current, open: isOpen}}>
                    <Card>
                        <CardBody>
                            {children}
                        </CardBody>
                        <ReportAccordionButton pageId={getPage()?.id} sectionId={id} sectionTitle={trustedTitle}/>
                    </Card>
                </AccordionSectionContext.Provider>
            </Collapse>
        </div>
    </div>;
});
