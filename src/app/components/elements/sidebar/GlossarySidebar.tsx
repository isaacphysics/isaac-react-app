import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Stage } from "../../../../IsaacApiTypes";
import { stageLabelMap, isFullyDefinedContext, isSingleStageContext, PHY_NAV_SUBJECTS, HUMAN_STAGES, nonemptyOrUndefined } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { GlossarySearch } from "../../pages/Glossary";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { Tag } from "../../../../IsaacAppTypes";

interface GlossarySidebarProps extends ContentSidebarProps {
    searchText: string;
    setSearchText: (searchText: string) => void;
    filterSubject: Tag | undefined;
    setFilterSubject: React.Dispatch<React.SetStateAction<Tag | undefined>>;
    filterStages: Stage[] | undefined;
    setFilterStages: React.Dispatch<React.SetStateAction<Stage[] | undefined>>;
    subjects: Tag[];
    stages: Stage[];
    subjectCounts: { [key: string]: number; }
    stageCounts: { [key: string]: number; }
}

export const GlossarySidebar = (props: GlossarySidebarProps) => {
    const { searchText, setSearchText, filterSubject, setFilterSubject, filterStages, setFilterStages,
        subjects, stages, subjectCounts, stageCounts, optionBar, ...rest } = props;

    const navigate = useNavigate();
    const pageContext = useAppSelector(selectors.pageContext.context);

    const updateFilterStages = (stage: Stage) =>{
        if (filterStages && filterStages.includes(stage)) {
            if (filterStages.length === 1) {
                setFilterStages(undefined);
            }
            else {
                setFilterStages(filterStages.filter(s => s !== stage));
            }
        }
        else {
            setFilterStages(filterStages ? [...filterStages, stage] : [stage]);
        }
    };

    // Deselect stage filters that no longer have results following a subject/search term change
    useEffect(() => {
        if (stageCounts["all"] > 0) {
            setFilterStages(fs => nonemptyOrUndefined(fs?.filter(stage => stageCounts[stage])));
        }
    }, [filterSubject, searchText, setFilterStages, stageCounts]);

    return <ContentSidebar buttonTitle="Search glossary" optionBar={optionBar} {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search glossary</h5>
            <GlossarySearch searchText={searchText} setSearchText={setSearchText} />
            <div className="section-divider"/>

            {!pageContext?.subject && <>
                <h5>Select subject</h5>
                <ul>
                    {subjects.map(subject => <li key={subject.id}>
                        <StyledTabPicker checkboxTitle={subject.title} data-bs-theme={subject.id}
                            checked={filterSubject && filterSubject === subject} count={subjectCounts[subject.id]}
                            onChange={() => setFilterSubject(subject)}/>
                    </li>)}
                </ul>
            </>}

            {!pageContext?.subject && !pageContext?.stage?.length && <div className="section-divider"/>}

            {!pageContext?.stage?.length && <>
                <h5 className="mt-4">Select stage</h5>
                <ul>
                    <li>
                        <StyledTabPicker checkboxTitle="All" data-bs-theme={filterSubject?.id}
                            checked={!filterStages} count={stageCounts["all"]} onChange={() => setFilterStages(undefined)}/>
                    </li>
                    <div className="section-divider-small"/>
                    {stages.filter(stage => stageCounts[stage]).map(stage => <li key={stage}>
                        <StyledTabPicker checkboxTitle={stageLabelMap[stage]} data-bs-theme={filterSubject?.id}
                            checked={filterStages && filterStages.includes(stage)} count={stageCounts[stage]}
                            onChange={() => updateFilterStages(stage)}/>
                    </li>)}
                </ul>
            </>}

            {isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext) && <>
                <h5>Switch learning stage</h5>
                <ul>
                    {PHY_NAV_SUBJECTS[pageContext.subject].map((stage, index) =>
                        <li key={index}>
                            <StyledTabPicker
                                checkboxTitle={HUMAN_STAGES[stage]} checked={pageContext.stage[0] === stage}
                                onClick={() => navigate(`/${pageContext.subject}/${stage}/glossary`, { replace: true })}
                            />
                        </li>
                    )}
                </ul>
            </>}
        </search>
    </ContentSidebar>;
};
