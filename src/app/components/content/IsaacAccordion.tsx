import React from "react";
import {ContentDTO, Stage} from "../../../IsaacApiTypes";
import {Accordion} from "../elements/Accordion";
import {IsaacContent} from "./IsaacContent";
import {
    isIntendedAudience,
    mergeDisplayOptions,
    useUserContext,
    UseUserContextReturnType
} from "../../services/userContext";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {AppState} from "../../state/reducers";
import {resourceFound} from "../../services/validation";
import {
    DOCUMENT_TYPE,
    STAGE,
    STAGE_NULL_OPTIONS,
    stageLabelMap,
    STAGES_CS,
    stagesOrdered
} from "../../services/constants";
import {comparatorFromOrderedValues} from "../../services/gameboards";

const defaultConceptDisplay = {
    [SITE.PHY]: {audience: ["closed"], nonAudience: ["de-emphasised", "closed"]},
    [SITE.CS]: {audience: ["closed"], nonAudience: ["de-emphasised", "closed"]}
}[SITE_SUBJECT];
const defaultQuestionDisplay = {audience: [], nonAudience: []};

function stringifyAudience(audience: ContentDTO["audience"], userContext: UseUserContextReturnType): string {
    let stagesSet: Set<Stage>;
    if (!audience) {
        stagesSet = {
            [SITE.PHY]: new Set<Stage>([STAGE.NONE]),
            [SITE.CS]: new Set<Stage>(Array.from(STAGES_CS).filter(s => !STAGE_NULL_OPTIONS.has(s)))
        }[SITE_SUBJECT];
    } else {
        stagesSet = new Set<Stage>();
        audience.forEach(audienceRecord => audienceRecord.stage?.forEach(stage => stagesSet.add(stage)));
    }
    // order stages
    const audienceStages = Array.from(stagesSet).sort(comparatorFromOrderedValues(stagesOrdered));
    // if you are one of the options - only show that option
    const stagesFilteredByUserContext = audienceStages.filter(s => userContext.stage === s);
    const stagesToView = stagesFilteredByUserContext.length > 0 ? stagesFilteredByUserContext : audienceStages;
    // If common, could find substrings and report ranges i.e, GCSE to University

    return stagesToView.map(stage => stageLabelMap[stage]).join(" & ");
}

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
    const defaultDisplay = resourceFound(page) && page.type === DOCUMENT_TYPE.CONCEPT ? defaultConceptDisplay : defaultQuestionDisplay;
    const accordionDisplay = mergeDisplayOptions(defaultDisplay, doc.display);

    return <div className="isaac-accordion">
        {(doc.children as SectionWithDisplaySettings[] | undefined)

            // We take the doc's children's index as a key for each section so that react is not confused between filtering/reordering.
            ?.map((section, index) => ({...section, sectionIndex: index}))

            // For CS we want relevant sections to appear first
            .sort((sectionA, sectionB) => {
                if (SITE_SUBJECT !== SITE.CS) {return 0;}
                const isAudienceA = isIntendedAudience(sectionA.audience, userContext, user);
                const isAudienceB = isIntendedAudience(sectionB.audience, userContext, user);
                return isAudienceA === isAudienceB ? 0 : isAudienceB ? 1 : -1;
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
