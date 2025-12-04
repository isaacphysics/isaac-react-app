import classNames from "classnames";
import React, { Dispatch, SetStateAction, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Input } from "reactstrap";
import { Stage } from "../../../../IsaacApiTypes";
import { tags, TAG_ID, PHY_NAV_SUBJECTS, isSingleStageContext, getFilteredStageOptions } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { AffixButton } from "../AffixButton";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { Tag } from "../../../../IsaacAppTypes";
import { FilterCheckbox, AllFiltersCheckbox } from "./SidebarElements";

interface PracticeQuizzesSidebarProps extends ContentSidebarProps {
    filterText: string;
    setFilterText: Dispatch<SetStateAction<string>>;
    filterTags?: Tag[];
    setFilterTags: Dispatch<SetStateAction<Tag[]>>;
    tagCounts: Record<string, number>;
    filterStages?: Stage[];
    setFilterStages: Dispatch<SetStateAction<Stage[] | undefined>>;
    stageCounts: Record<string, number>;
}

export const PracticeQuizzesSidebar = (props: PracticeQuizzesSidebarProps) => {
    const { filterText, setFilterText, filterTags, setFilterTags, tagCounts, filterStages, setFilterStages, stageCounts, ...rest } = props;
    const pageContext = useAppSelector(selectors.pageContext.context);
    const subjectTag = tags.getById(pageContext?.subject as TAG_ID);
    const fields = pageContext?.subject ? tags.getChildren(pageContext.subject as TAG_ID) : [];


    const updateFilterStages = (stage: Stage) => {
        if (filterStages?.includes(stage)) {
            setFilterStages(filterStages.filter(s => s !== stage));
        } else {
            setFilterStages([...(filterStages ?? []), stage]);
        }
    };

    // Clear stage filters on subject change, since previous stages may not be visible to deselect
    useEffect(() => {
        setFilterStages(undefined);
    }, [filterTags, setFilterStages]);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search practice tests</h5>
            <Input type="search" placeholder="e.g. Practice" value={filterText} className="search--filter-input my-3"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)} />

            {!pageContext?.subject && Object.keys(PHY_NAV_SUBJECTS).filter(s => tagCounts[s] > 0).length > 0 && <>
                <div className="section-divider"/>
                <h5>Filter by subject and topic</h5>
                <ul>
                    {Object.keys(PHY_NAV_SUBJECTS).filter(s => tagCounts[s] > 0).map((subject, i) => {
                        const subjectTag = tags.getById(subject as TAG_ID);
                        const descendentTags = tags.getChildren(subjectTag.id);
                        const isSelected = filterTags?.includes(subjectTag) || descendentTags.some(tag => filterTags?.includes(tag));
                        const isPartial = descendentTags.some(tag => filterTags?.includes(tag)) && descendentTags.some(tag => !filterTags?.includes(tag));
                        return <li key={i} className={classNames("ps-2", {"checkbox-active": isSelected})}>
                            <FilterCheckbox
                                checkboxStyle="button" color="theme" data-bs-theme={subject} tag={subjectTag} conceptFilters={filterTags as Tag[]}
                                setConceptFilters={setFilterTags} tagCounts={tagCounts} dependentTags={descendentTags} incompatibleTags={descendentTags}
                                partiallySelected={descendentTags.some(tag => filterTags?.includes(tag))}
                                className={classNames({"icon-checkbox-off": !isSelected, "icon icon-checkbox-partial-alt": isSelected && isPartial, "icon-checkbox-selected": isSelected && !isPartial})}
                            />
                            {isSelected && <ul className="ms-3 ps-2">
                                {descendentTags.filter(tag => tagCounts[tag.id] > 0)
                                    .map((tag, j) => <li key={j}>
                                        <FilterCheckbox
                                            checkboxStyle="button" color="theme" bsSize="sm" data-bs-theme={subject} tag={tag} conceptFilters={filterTags as Tag[]}
                                            setConceptFilters={setFilterTags} tagCounts={tagCounts} incompatibleTags={[subjectTag]} baseTag={subjectTag}
                                        />
                                    </li>)}
                            </ul>}
                        </li>;
                    })}
                </ul>
            </>}

            {pageContext?.subject && fields.filter(tag => tagCounts[tag.id] > 0).length > 0 && <>
                <div className="section-divider"/>
                <h5>Filter by topic</h5>
                <ul className="ps-2">
                    <li>
                        <AllFiltersCheckbox
                            conceptFilters={filterTags ?? []} setConceptFilters={setFilterTags} tagCounts={tagCounts} baseTag={subjectTag}
                        />
                    </li>
                    <div className="section-divider-small"/>
                    {fields.filter(tag => tagCounts[tag.id] > 0)
                        .map((tag, j) => <li key={j} >
                            <FilterCheckbox
                                tag={tag} conceptFilters={filterTags ?? []} setConceptFilters={setFilterTags}
                                tagCounts={tagCounts} incompatibleTags={[subjectTag]}
                            />
                        </li>)}
                </ul>
            </>}

            {!isSingleStageContext(pageContext) && getFilteredStageOptions().filter(s => stageCounts[s.label] > 0).length > 0 && <>
                <div className="section-divider"/>
                <h5>Filter by stage</h5>
                <ul className="ps-2">
                    {getFilteredStageOptions().filter(s => stageCounts[s.label] > 0).map((stage, i) =>
                        <li key={i}>
                            <StyledCheckbox checked={filterStages?.includes(stage.value)}
                                label={<>{stage.label} {tagCounts && <span className="text-muted">({stageCounts[stage.label]})</span>}</>}
                                color="theme" data-bs-theme={filterTags?.length === 1 ? filterTags[0].id : undefined}
                                onChange={() => {updateFilterStages(stage.value);}}/>
                        </li>)}
                </ul>
            </>}
        </search>

        <div className="section-divider"/>
        <div className="sidebar-help">
            <p>You can see all of the tests that you have in progress or have completed in your My Isaac:</p>
            <AffixButton size="md" color="keyline" tag={Link} to="/tests" affix={{
                affix: "icon-arrow-right",
                position: "suffix",
                type: "icon"
            }}>
                My tests
            </AffixButton>
        </div>
    </ContentSidebar>;
};
