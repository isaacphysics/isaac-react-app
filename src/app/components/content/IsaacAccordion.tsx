import React, { useMemo } from "react";
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
    isRelevantPageContextOrIntendedAudience,
    LEARNING_STAGE_TO_STAGES,
    makeIntendedAudienceComparator,
    mergeDisplayOptions,
    siteSpecific,
    STAGE,
    STAGE_TO_LEARNING_STAGE,
    stageLabelMap,
    stringifyAudience,
    useUserViewingContext
} from "../../services";
import {selectors, useAppSelector} from "../../state";
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

const StageInsert = ({stage}: {stage: string}) => {
    const isAdditional = stage.startsWith("additional");
    return <>
        <div className="section-divider mt-4 mb-3"/>
        <h4>{isAdditional 
            ? "Additional learning stages" 
            : stageLabelMap[stage as keyof typeof stageLabelMap]
        }</h4>
        {isAdditional && <p className="small text-muted">
            You may also be interested in exploring additional material relevant to other learning stages:
        </p>}
    </>;
};

export const IsaacAccordion = ({doc}: {doc: ContentDTO}) => {
    const page = useAppSelector(selectors.doc.get);
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();
    const pageContext = useAppSelector(selectors.pageContext.context);

    const isConceptPage = page && page !== 404 && page.type === DOCUMENT_TYPE.CONCEPT;

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
            const sectionDisplaySettings = isRelevantPageContextOrIntendedAudience(section.audience, userContext, user, pageContext) 
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
        // this assumes pages display sections in increasing stage order! true for phy, not for ada
        let stageToFirstIndexMap = isConceptPage && sections
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

        const getMaxRelevantIndex = () => {
            const learningStage = STAGE_TO_LEARNING_STAGE[userContext.stage];
            if (learningStage) {
                const applicableStages = LEARNING_STAGE_TO_STAGES[learningStage];
                return Math.max(...applicableStages.map(stage => stageToFirstIndexMap[stage] ?? -1));
            }
            return -1; // only occurs when userContext.stage === STAGE.ALL
        };

        // if we need to show everything, don't remove anything
        if (userContext.stage && isDefined(stageToFirstIndexMap[userContext.stage]) && userContext.stage !== STAGE.ALL) {
            const beforeUserStage = Object.keys(stageToFirstIndexMap).filter(stage => {
                return stageToFirstIndexMap[stage] < stageToFirstIndexMap[userContext.stage];
            });
            const afterUserStage = Object.keys(stageToFirstIndexMap).filter(stage => {
                return stageToFirstIndexMap[stage] > getMaxRelevantIndex();
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
    }, [isConceptPage, sections, userContext.stage]);

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
                    startOpen={section.startOpen || !isDefined(firstSectionToOpen) ? undefined : index === firstSectionToOpen} /* use default <Accordion/> startOpen behaviour if behaviour undefined */
                    deEmphasised={section.deEmphasised}
                    trustedTitle={section?.title || ""}
                    audienceString={audienceString}
                >
                    <IsaacContent doc={section} />
                </Accordion>
            </>;
        })}
    </div>;
};
