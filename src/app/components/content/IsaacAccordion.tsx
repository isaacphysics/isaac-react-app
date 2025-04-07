import React, { useContext, useMemo } from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {Accordion} from "../elements/Accordion";
import {IsaacContent} from "./IsaacContent";
import {
    DOCUMENT_TYPE,
    isAda,
    isDefined,
    isFound,
    isIntendedAudience,
    isPhy,
    makeIntendedAudienceComparator,
    mergeDisplayOptions,
    siteSpecific,
    STAGE,
    stageLabelMap,
    stringifyAudience,
    useUserViewingContext
} from "../../services";
import {AppState, selectors, useAppSelector} from "../../state";
import {useLocation} from "react-router-dom";
import { IsConceptContext } from "../../../IsaacAppTypes";

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

const StageInsert = ({stage}: {stage: string}) => {
    const isAdditional = stage.startsWith("additional");
    return <>
        <div className="section-divider mt-4 mb-3" />
        <h4 className="text-theme-dark">{isAdditional 
            ? "Additional learning stages" 
            : stageLabelMap[stage as keyof typeof stageLabelMap]
        }</h4>
        <p className="small text-muted">{isAdditional
            ? "You may also be interested in exploring additional material relevant to other learning stages:"
            : `Expand the sections below for more information on ${stageLabelMap[stage as keyof typeof stageLabelMap]} topics:`
        }</p>
    </>;
};

export const IsaacAccordion = ({doc}: {doc: ContentDTO}) => {
    const page = useAppSelector((state: AppState) => (state && state.doc) || null);
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();
    const conceptContext = useContext(IsConceptContext);

    // Select different default display depending on page type
    const defaultDisplay = isFound(page) && page.type === DOCUMENT_TYPE.CONCEPT ? defaultConceptDisplay : defaultQuestionDisplay;
    const accordionDisplay = mergeDisplayOptions(defaultDisplay, doc.display);

    const location = useLocation();
    const hashAnchor = location.hash !== "" && location.hash[0] === '#' ? location.hash.slice(1) : null;

    const sections = (doc.children as SectionWithDisplaySettings[] | undefined)
        // We take the doc's children's index as a key for each section so that react is not confused between filtering/reordering.
        ?.map((section, index) => ({...section, sectionIndex: index}))

        // For CS we want relevant sections to appear first
        .sort((a, b) => {
            if (!isAda) {return 0;}
            return makeIntendedAudienceComparator(user, userContext)(a, b);
        })

        // Handle conditional display settings
        .map(section => {
            const sectionDisplay = mergeDisplayOptions(accordionDisplay, section.display);
            const sectionDisplaySettings = isIntendedAudience(section.audience, userContext, user) 
                ? sectionDisplay?.["audience"] 
                : sectionDisplay?.["nonAudience"];
            if (sectionDisplaySettings?.includes("open")) {section.startOpen = true;}
            if (sectionDisplaySettings?.includes("closed")) {section.startOpen = false;}
            if (sectionDisplaySettings?.includes("de-emphasised")) {section.deEmphasised = true;}
            if (sectionDisplaySettings?.includes("hidden")) {section.hidden = true;}
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
        .filter(section => !section.hidden);

    const stageIndices = useMemo(() => {
        let stageToFirstIndexMap = conceptContext && sections
            ?.reduce((acc, section, index) => {
                if (!section.audience?.[0].stage?.[0]) {
                    // ignore sections without a stage
                    return acc;
                }
                else if (!isDefined(acc[section.audience[0].stage[0]])) {
                    // if the section has a stage and we haven't seen it before, add it to the accumulator
                    return {...acc, [section.audience[0].stage[0]]: index};
                }
                return acc;
            }, {} as Record<string, number>) || {};
            
        // at this point, there exists a stageIndex for each unique stage.
        // now collapse indices before/after the userContext stage into "additional learning stages" when there are multiple

        // if we need to show everything, don't remove anything
        if (userContext.stage && isDefined(stageToFirstIndexMap[userContext.stage]) && userContext.stage !== STAGE.ALL) {
            const beforeUserStage = Object.keys(stageToFirstIndexMap).filter(stage => {
                return stageToFirstIndexMap[stage] < stageToFirstIndexMap[userContext.stage];
            });
            const afterUserStage = Object.keys(stageToFirstIndexMap).filter(stage => {
                return stageToFirstIndexMap[stage] > stageToFirstIndexMap[userContext.stage];
            });

            if (beforeUserStage.length > 1) {
                stageToFirstIndexMap = {
                    ...stageToFirstIndexMap,
                    "additional_pre": stageToFirstIndexMap[beforeUserStage[0]]
                };
                beforeUserStage.forEach(stage => {
                    delete stageToFirstIndexMap[stage];
                });
            }

            if (afterUserStage.length > 1) {
                stageToFirstIndexMap = {
                    ...stageToFirstIndexMap,
                    "additional_post": stageToFirstIndexMap[afterUserStage[0]]
                };
                afterUserStage.forEach(stage => {
                    delete stageToFirstIndexMap[stage];
                });
            }
        }

        return stageToFirstIndexMap;
    }, [conceptContext, sections, userContext.stage]);

    const stageInserts = useMemo(() => {
        // flip key and value; we don't construct it this way as when building we need fast lookup of audience
        const invertedStageIndices = Object.entries(stageIndices).reduce((acc, [stage, index]) => {
            return {...acc, [index]: stage};
        }, {} as Record<number, string>);

        return invertedStageIndices;
    }, [stageIndices]);

    const firstSectionToOpen = useMemo(() => {
        if (sections?.some(section => section.startOpen)) return undefined;
        if (!userContext.stage || userContext.stage === STAGE.ALL) return undefined;
        return stageIndices[userContext.stage];
    }, [sections, stageIndices, userContext.stage]);

    return <div className="isaac-accordion">
        {sections?.map((section, index) => {
            const intendedAudience = isIntendedAudience(section.audience, userContext, user);
            const audienceString = stringifyAudience(section.audience, userContext, intendedAudience);
            return <>
                {isPhy && stageInserts?.[index] && <StageInsert stage={stageInserts[index]} />}
                <Accordion
                    key={`${section.sectionIndex} ${index}`} id={section.id} index={index}
                    startOpen={section.startOpen || index === firstSectionToOpen} deEmphasised={section.deEmphasised}
                    trustedTitle={section?.title || ""}
                    audienceString={audienceString}
                >
                    <IsaacContent doc={section} />
                </Accordion>
            </>;
        })}
    </div>;
};
