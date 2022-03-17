import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {Accordion} from "../elements/Accordion";
import {IsaacContent} from "./IsaacContent";
import {
    isIntendedAudience,
    makeIntendedAudienceComparator,
    mergeDisplayOptions,
    stringifyAudience,
    useUserContext
} from "../../services/userContext";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {AppState} from "../../state/reducers";
import {DOCUMENT_TYPE} from "../../services/constants";
import {isFound} from "../../services/miscUtils";
import {Alert, Col, Row} from "reactstrap";

const defaultConceptDisplay = {
    [SITE.PHY]: {audience: ["closed"], nonAudience: ["de-emphasised", "closed"]},
    [SITE.CS]: {audience: ["closed"], nonAudience: ["de-emphasised", "closed"]}
}[SITE_SUBJECT];
const defaultQuestionDisplay = {audience: [], nonAudience: []};

interface SectionWithDisplaySettings extends ContentDTO {
    startOpen?: boolean;
    deEmphasised?: boolean;
    hidden?: boolean;
}
export const IsaacAccordion = ({doc}: {doc: ContentDTO}) => {
    const page = useSelector((state: AppState) => (state && state.doc) || null);
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();

    // Select different default display depending on page type
    const defaultDisplay = isFound(page) && page.type === DOCUMENT_TYPE.CONCEPT ? defaultConceptDisplay : defaultQuestionDisplay;
    const accordionDisplay = mergeDisplayOptions(defaultDisplay, doc.display);

    const hashAnchor = location.hash.includes('#') ? location.hash.slice(1) : 'undefined-string-will-never-match';

    return <div className="isaac-accordion">
        {hashAnchor !== 'undefined-string-will-never-match' && <Row><Col><Alert color="warning">You see this section despite it not being relevant to your content preferences because you have followed a direct link.</Alert></Col></Row>}
        {(doc.children as SectionWithDisplaySettings[] | undefined)

            // We take the doc's children's index as a key for each section so that react is not confused between filtering/reordering.
            ?.map((section, index) => ({...section, sectionIndex: index}))

            // For CS we want relevant sections to appear first
            .sort((a, b) => {
                if (SITE_SUBJECT !== SITE.CS) {return 0;}
                return makeIntendedAudienceComparator(user, userContext)(a, b);
            })

            // Handle conditional display settings
            .map(section => {
                let sectionDisplay = mergeDisplayOptions(accordionDisplay, section.display);
                const sectionDisplaySettings = isIntendedAudience(section.audience, userContext, user) ?
                        sectionDisplay?.["audience"] : sectionDisplay?.["nonAudience"];
                if (sectionDisplaySettings?.includes("open")) {section.startOpen = true;}
                if (sectionDisplaySettings?.includes("closed")) {section.startOpen = false;}
                if (sectionDisplaySettings?.includes("de-emphasised")) {section.deEmphasised = true;}
                if (sectionDisplaySettings?.includes("hidden")) {section.hidden = true;}
                return section;
            })

            // If cs have "show other content" set to false hide non-audience content
            .map(section => {
                if (
                    SITE_SUBJECT === SITE.CS && userContext.showOtherContent === false &&
                    !isIntendedAudience(section.audience, userContext, user)
                ) {
                    section.hidden = true;
                }
                return section;
            })

            // If we followed a direct link to a section, we want to show it regardless
            // of any other settings. We also want to show a message somewhere on the page.
            .map(section => {
                if ((section.id || "").includes(hashAnchor)) {
                    section.hidden = false;
                }
                return section;
            })

            // Filter out hidden sections before they mess up indexing
            .filter(section => !section.hidden)

            .map((section , index) =>
                <Accordion
                    key={`${section.sectionIndex} ${index}`} id={section.id} index={index}
                    startOpen={section.startOpen} deEmphasised={section.deEmphasised}
                    trustedTitle={section?.title || ""}
                    audienceString={stringifyAudience(section.audience, userContext)}
                >
                    <IsaacContent doc={section} />
                </Accordion>
            )}
    </div>;
};
