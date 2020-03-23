import React, {useEffect, useState, useRef} from "react";
import * as RS from "reactstrap";
import {withRouter} from "react-router-dom";
import {ALPHABET} from "../../services/constants";
import {connect, useSelector} from "react-redux";
import {logAction} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {scrollVerticallyIntoView} from "../../services/scrollManager";
import {TrustedHtml} from "./TrustedHtml";
import {AccordionSectionContext} from "../../../IsaacAppTypes";
import {questions} from "../../state/selectors";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";

interface AccordionsProps {
    id?: string;
    trustedTitle?: string;
    index: number;
    location: {hash: string};
    children: React.ReactChildren;
    logAction: (eventDetails: object) => void;
}

let nextClientId = 0;

const AccordionComponent = ({id, trustedTitle, index, children, location: {hash}}: AccordionsProps) => {
    // Toggle
    const isFirst = index === 0;
    const [open, setOpen] = useState(isFirst);
    const page = useSelector((state: AppState) => (state && state.doc) || null);

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
        if (page && page != 404) {
            switch (page.type) {
                case "isaacQuestionPage":
                    logAction({
                        type: "QUESTION_PART_OPEN",
                        questionPageId: page.id,
                        questionPartIndex: index,
                        questionPartId: id
                    });
                    break;
                case "isaacConceptPage":
                    logAction({
                        type: "CONCEPT_SECTION_OPEN",
                        conceptPageId: page.id,
                        conceptSectionIndex: index,
                        conceptSectionLevel: null,
                        conceptSectionId: id
                    });
                    // TODO for IP add doc.level for conceptSectionLevel event
                    break;
                default:
                    logAction({
                        type: "ACCORDION_SECTION_OPEN",
                        pageId: page.id,
                        accordionId: id,
                        accordionTitle: trustedTitle,
                        accordionIndex: index
                    })
            }
        }
    }

    // Question result summarization
    const clientId = useRef('c' + nextClientId++);

    // Check results of questions in this accordion
    let accordianIcon;
    const questionsInsideThis = useSelector((state: AppState) => {
        return questions.filter(q => q.accordionClientId === clientId.current)(state);
    });
    if (questionsInsideThis.length > 0) {
        let allCorrect = true;
        let allWrong = true;
        let allValidated = true;
        questionsInsideThis.forEach(question => {
            if (question) {
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
            }
        });
        if (allValidated && allCorrect) accordianIcon = "tick";
        if (allValidated && allWrong) accordianIcon = "cross";
    }

    return <div className="accordion">
        <div className="accordion-header">
            <RS.Button
                id={anchorId || ""} block color="link"
                className={open ? 'active p-3 text-left' : 'p-3 text-left'}
                onClick={(event: any) => {
                    const nextState = !open;
                    setOpen(nextState);
                    if (nextState) {
                        logAccordionOpen();
                        scrollVerticallyIntoView(event.target);
                    }
                }}
                aria-expanded={open ? "true" : "false"}
            >
                <div className="accordion-part">
                    <span className="text-secondary">Part {ALPHABET[index % ALPHABET.length]}  {" "}</span>
                    {trustedTitle && <TrustedHtml html={trustedTitle} />}
                </div>
                {accordianIcon && SITE_SUBJECT === SITE.PHY && <span className={"accordion-icon accordion-icon-" + accordianIcon}>
                    <span className="sr-only">{accordianIcon == "tick" ? "All questions in this part are answered correctly" : "All questions in this part are answered incorrectly"}</span>
                </span>}
            </RS.Button>
        </div>
        <RS.Collapse isOpen={open} className="mt-1">
            <AccordionSectionContext.Provider value={{id, clientId: clientId.current}}>
                <RS.Card>
                    <RS.CardBody>
                        {children}
                    </RS.CardBody>
                </RS.Card>
            </AccordionSectionContext.Provider>
        </RS.Collapse>
    </div>;
};

export const Accordion = withRouter(connect(null, {logAction: logAction})(AccordionComponent));
