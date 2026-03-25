import React, { useEffect, ChangeEvent, useMemo } from "react";
import { Input } from "reactstrap";
import { tags, TAG_ID, getSearchPlaceholder, isDefined, PHY_NAV_SUBJECTS, getFilteredStageOptions, TAG_LEVEL } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { Tag } from "../../../../IsaacAppTypes";
import { Stage } from "../../../../IsaacApiTypes";
import classNames from "classnames";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { AllFiltersCheckbox, FilterCheckbox } from "./SidebarElements";

interface SubjectSpecificConceptsListingSidebarProps extends ContentSidebarProps {
    searchText: string | null;
    setSearchText: React.Dispatch<React.SetStateAction<string | null>>;
    conceptFilters: Tag[];
    setConceptFilters: React.Dispatch<React.SetStateAction<Tag[]>>;
    applicableTags: Tag[];
    tagCounts: Record<string, number>;
}

export const SubjectSpecificConceptsListingSidebar = (props: SubjectSpecificConceptsListingSidebarProps) => {
    const { searchText, setSearchText, conceptFilters, setConceptFilters, applicableTags, tagCounts, ...rest } = props;

    const pageContext = useAppSelector(selectors.pageContext.context);

    const subjectTag = tags.getById(pageContext?.subject as TAG_ID);

    // Deselect topic filter if search term change causes no results
    useEffect(() => {
        if (searchText && searchText.length > 0) {
            const remainingFilters = conceptFilters.filter(tag => tagCounts[tag.id] > 0);
            setConceptFilters(remainingFilters.length ? remainingFilters : (subjectTag ? [subjectTag] : []));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search concepts</h5>
            <Input
                className='search--filter-input my-4'
                type="search" value={searchText || ""}
                placeholder={`e.g. ${getSearchPlaceholder(pageContext?.subject)}`}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />

            <div className="section-divider"/>

            <div className="d-flex flex-column">
                <h5>Filter by topic</h5>
                <ul>
                    <li>
                        <AllFiltersCheckbox
                            conceptFilters={conceptFilters} setConceptFilters={setConceptFilters} tagCounts={tagCounts} baseTag={subjectTag}
                            forceEnabled={applicableTags.filter(tag => !isDefined(tagCounts) || tagCounts[tag.id] > 0).length === 0}
                        />
                    </li>
                    <div className="section-divider-small"/>
                    {applicableTags
                        .filter(tag => !isDefined(tagCounts) || tagCounts[tag.id] > 0)
                        .map(tag => <li key={tag.id}>
                            <FilterCheckbox
                                key={tag.id}
                                tag={tag}
                                conceptFilters={conceptFilters}
                                setConceptFilters={setConceptFilters}
                                tagCounts={tagCounts}
                                incompatibleTags={[subjectTag]}
                            /></li>
                        )
                    }
                </ul>
            </div>
        </search>
    </ContentSidebar>;
};

interface GenericConceptsListingSidebarProps extends SubjectSpecificConceptsListingSidebarProps {
    searchStages: Stage[];
    setSearchStages: React.Dispatch<React.SetStateAction<Stage[]>>;
    stageCounts: Record<string, number>;
}

export const GenericConceptsListingSidebar = (props: GenericConceptsListingSidebarProps) => {
    const { searchText, setSearchText, conceptFilters, setConceptFilters, tagCounts, searchStages, setSearchStages, stageCounts, applicableTags: _applicableTags, ...rest } = props;

    const updateSearchStages = (stage: Stage) => {
        if (searchStages.includes(stage)) {
            setSearchStages(searchStages.filter(s => s !== stage));
        } else {
            setSearchStages([...(searchStages ?? []), stage]);
        }
    };

    // If exactly one subject is selected, infer a colour for the stage checkboxes
    const singleSubjectColour = useMemo(() => {
        return conceptFilters.length === 1 && conceptFilters[0].type === TAG_LEVEL.subject ? conceptFilters[0].id
            : conceptFilters.length && conceptFilters.every(tag => tag.parent === conceptFilters[0].parent) ? conceptFilters[0].parent
                : undefined;
    }, [conceptFilters]);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search concepts</h5>
            <Input
                className='search--filter-input my-4'
                type="search" value={searchText || ""}
                placeholder={`e.g. ${getSearchPlaceholder()}`}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />

            <div className="section-divider"/>

            <div className="d-flex flex-column">
                <h5>Filter by subject and topic</h5>
                <ul>
                    {Object.keys(PHY_NAV_SUBJECTS).map((subject, i) => {
                        const subjectTag = tags.getById(subject as TAG_ID);
                        const descendentTags = tags.getChildren(subjectTag.id);
                        const isSelected = conceptFilters.includes(subjectTag) || descendentTags.some(tag => conceptFilters.includes(tag));
                        const isPartial = descendentTags.some(tag => conceptFilters.includes(tag)) && descendentTags.some(tag => !conceptFilters.includes(tag));
                        return <li key={i} className={classNames("ps-2", {"checkbox-active": isSelected})}>
                            <FilterCheckbox
                                checkboxStyle="button" color="theme" data-bs-theme={subject} tag={subjectTag} conceptFilters={conceptFilters}
                                setConceptFilters={setConceptFilters} tagCounts={tagCounts} dependentTags={descendentTags} incompatibleTags={descendentTags}
                                partial partiallySelected={descendentTags.some(tag => conceptFilters.includes(tag))} // not quite isPartial; this is also true if all descendents selected
                                className={classNames("icon", {"icon-checkbox-off": !isSelected, "icon-checkbox-partial-alt": isSelected && isPartial, "icon-checkbox-selected": isSelected && !isPartial})}
                            />
                            {isSelected && <ul className="ms-3 ps-2">
                                {descendentTags
                                    .filter(tag => !isDefined(tagCounts) || tagCounts[tag.id] > 0 || conceptFilters.includes(tag))
                                    // .sort((a, b) => tagCounts ? tagCounts[b.id] - tagCounts[a.id] : 0)
                                    .map((tag, j) => <li key={j}>
                                        <FilterCheckbox checkboxStyle="button" color="theme" bsSize="sm" data-bs-theme={subject} tag={tag} conceptFilters={conceptFilters}
                                            setConceptFilters={setConceptFilters} tagCounts={tagCounts} incompatibleTags={[subjectTag]} baseTag={subjectTag} />
                                    </li>)
                                }
                            </ul>}
                        </li>;
                    })}
                </ul>
                <div className="section-divider"/>
                <h5>Filter by stage</h5>
                <ul className="ps-2">
                    {getFilteredStageOptions().filter(s => stageCounts[s.value] > 0 || searchStages.includes(s.value)).map((stage) =>
                        <li key={stage.value}>
                            <StyledCheckbox checked={searchStages.includes(stage.value)}
                                label={<>{stage.label} <span className="text-muted">({stageCounts[stage.value]})</span></>}
                                data-bs-theme={singleSubjectColour}
                                color="theme" onChange={() => {updateSearchStages(stage.value);}}/>
                        </li>)}
                </ul>
            </div>
        </search>
    </ContentSidebar>;
};
