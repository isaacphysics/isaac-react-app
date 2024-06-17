import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {Accordion} from "../elements/Accordion";
import {IsaacContent} from "./IsaacContent";
import {
    DOCUMENT_TYPE,
    isAda,
    isFound,
    isIntendedAudience,
    makeIntendedAudienceComparator,
    mergeDisplayOptions,
    siteSpecific,
    stringifyAudience,
    useUserViewingContext
} from "../../services";
import {AppState, selectors, useAppSelector} from "../../state";
import {useLocation} from "react-router-dom";

const defaultConceptDisplay = siteSpecific(
    {audience: ["closed"], nonAudience: ["de-emphasised", "closed"]},
    {audience: ["closed"], nonAudience: ["de-emphasised", "closed"]}
);
const defaultQuestionDisplay = {audience: [], nonAudience: []};

interface SectionWithDisplaySettings extends ContentDTO {
    startOpen?: boolean;
    deEmphasised?: boolean;
    hidden?: boolean;
}
export const IsaacAccordion = ({doc}: {doc: ContentDTO}) => {
    const page = useAppSelector((state: AppState) => (state && state.doc) || null);
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();

    // Select different default display depending on page type
    const defaultDisplay = isFound(page) && page.type === DOCUMENT_TYPE.CONCEPT ? defaultConceptDisplay : defaultQuestionDisplay;
    const accordionDisplay = mergeDisplayOptions(defaultDisplay, doc.display);

    const location = useLocation();
    const hashAnchor = location.hash !== "" && location.hash[0] === '#' ? location.hash.slice(1) : null;

    return <div className="isaac-accordion">
        {(doc.children as SectionWithDisplaySettings[] | undefined)

            // We take the doc's children's index as a key for each section so that react is not confused between filtering/reordering.
            ?.map((section, index) => ({...section, sectionIndex: index}))

            // For CS we want relevant sections to appear first
            .sort((a, b) => {
                if (!isAda) {return 0;}
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
                    isAda && userContext.showOtherContent === false &&
                    !isIntendedAudience(section.audience, userContext, user)
                ) {
                    section.hidden = true;
                }
                return section;
            })

            // If we followed a direct link to a section, we want to show it regardless
            // of any other settings. We also want to show a message somewhere on the page.
            .map(section => {
                const parts = (section.id || "").split("|");
                if (parts.length > 1 && parts[1] === hashAnchor) {
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
