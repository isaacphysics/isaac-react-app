import React, { useEffect, ChangeEvent } from "react";
import { Input } from "reactstrap";
import { tags, TAG_ID, getSearchPlaceholder, isDefined } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { ContentSidebarProps, ContentSidebar, FilterCheckbox } from "../layout/SidebarLayout";
import { Tag } from "../../../../IsaacAppTypes";

export interface ConceptListSidebarProps extends ContentSidebarProps {
    searchText: string | null;
    setSearchText: React.Dispatch<React.SetStateAction<string | null>>;
    conceptFilters: Tag[];
    setConceptFilters: React.Dispatch<React.SetStateAction<Tag[]>>;
    applicableTags: Tag[];
    tagCounts: Record<string, number>;
}

export const SubjectSpecificConceptListSidebar = (props: ConceptListSidebarProps) => {
    const { searchText, setSearchText, conceptFilters, setConceptFilters, applicableTags, tagCounts, ...rest } = props;

    const pageContext = useAppSelector(selectors.pageContext.context);

    const subjectTag = tags.getById(pageContext?.subject as TAG_ID);

    // Deselect topic filter if search term change causes no results
    useEffect(() => {
        if (searchText && searchText.length > 0) {
            const remainingFilters = conceptFilters.filter(tag => tagCounts[tag.id] > 0);
            setConceptFilters(remainingFilters.length ? remainingFilters : [subjectTag]);
        }
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