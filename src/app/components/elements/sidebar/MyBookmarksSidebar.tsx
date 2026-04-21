import React, { useState, ChangeEvent, useMemo } from "react";
import { Input } from "reactstrap";
import { getFilteredStageOptions, getSearchPlaceholder, TAG_ID, tags } from "../../../services";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { CheckboxWrapper, StyledCheckbox } from "../inputs/StyledCheckbox";
import { CollapsibleList } from "../CollapsibleList";
import { ContentSummaryDTO } from "../../../../IsaacApiTypes";
import { BOOKMARKS_ORDER_NAMES, BookmarksOrder } from "../../../../IsaacAppTypes";

interface MyBookmarksSidebarProps extends ContentSidebarProps {
    bookmarks: ContentSummaryDTO[];
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    searchSubjects: string[];
    setSearchSubjects: React.Dispatch<React.SetStateAction<string[]>>;
    searchStages: string[];
    setSearchStages: React.Dispatch<React.SetStateAction<string[]>>;
    sortOrder: BookmarksOrder;
    setSortOrder: React.Dispatch<React.SetStateAction<BookmarksOrder>>;
}

export const MyBookmarksSidebar = (props: MyBookmarksSidebarProps) => {
    const { bookmarks, searchText, setSearchText, searchSubjects, setSearchSubjects, searchStages, setSearchStages, sortOrder, setSortOrder, ...rest } = props;

    // setSearchText is a debounced method that would not update on each keystroke, so we use this internal state to visually update the search text immediately
    const [internalSearchText, setInternalSearchText] = useState(searchText);
    const [subjectExpanded, toggleSubjectExpanded] = useState(true);
    const [stageExpanded, toggleStageExpanded] = useState(false);

    const tagCounts = useMemo<Record<string, number>>(() => {
        return bookmarks.reduce((counts, bookmark) => {
            bookmark.tags?.forEach(tag => {
                // only track tags we care about
                if (tags.allSubjectTags.includes(tags.getById(tag as TAG_ID))) {
                    counts[tag] = (counts[tag] || 0) + 1;
                }
            });
            return counts;
        }, {} as Record<string, number>);
    }, [bookmarks]);

    const stageCounts = useMemo<Record<string, number>>(() => {
        return bookmarks.reduce((counts, bookmark) => {
            bookmark.audience?.forEach(audience => {
                audience.stage?.forEach(stage => {
                    counts[stage] = (counts[stage] || 0) + 1;
                });
            });
            return counts;
        }, {} as Record<string, number>);
    }, [bookmarks]);

    return <ContentSidebar {...rest}>
        <search>
            <div className="section-divider"/>
            <h5>Search bookmarks</h5>
            <Input
                className='search--filter-input my-4'
                type="search" value={searchText || ""}
                placeholder={`e.g. ${getSearchPlaceholder()}`}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />

            <div className="section-divider"/>

            <h5>Filter bookmarks by...</h5>

            <div className="d-flex flex-column my-4">
                <CollapsibleList
                    title={"Subject"} expanded={subjectExpanded}
                    toggle={() => toggleSubjectExpanded(e => !e)}
                    numberSelected={searchSubjects.length}
                    className="ps-0"
                >
                    {tags.allSubjectTags.map((subject, index) => (
                        <li key={index}>
                            <CheckboxWrapper active={searchSubjects.includes(subject.id)}>
                                <StyledCheckbox
                                    color="primary"
                                    checked={searchSubjects.includes(subject.id)}
                                    onChange={() => setSearchSubjects(s => s.includes(subject.id) ? s.filter(v => v !== subject.id) : [...s, subject.id])}
                                    label={<>
                                        {subject.title} {" "}
                                        <span className="text-muted">({tagCounts[subject.id] || 0})</span>
                                    </>}
                                />
                            </CheckboxWrapper>
                        </li>
                    ))}
                </CollapsibleList>

                <CollapsibleList
                    title={"Learning stage"} expanded={stageExpanded}
                    toggle={() => toggleStageExpanded(e => !e)}
                    numberSelected={searchStages.length}
                >
                    {getFilteredStageOptions().map((stage, index) => (
                        <li key={index}>
                            <CheckboxWrapper active={searchStages.includes(stage.value)}>
                                <StyledCheckbox
                                    color="primary"
                                    checked={searchStages.includes(stage.value)}
                                    onChange={() => setSearchStages(s => s.includes(stage.value) ? s.filter(v => v !== stage.value) : [...s, stage.value])}
                                    label={<>
                                        {stage.label} {" "}
                                        <span className="text-muted">({stageCounts[stage.value] || 0})</span>
                                    </>}
                                />
                            </CheckboxWrapper>
                        </li>
                    ))}
                </CollapsibleList>
            </div>

            <h5>Sort bookmarks by...</h5>

            <Input type="select" className="ps-3 my-3" value={sortOrder} onChange={e => setSortOrder(e.target.value as BookmarksOrder)}>
                {Object.values(BookmarksOrder).map(order => <option key={order} value={order}>{BOOKMARKS_ORDER_NAMES[order]}</option>)}
            </Input>
        </search>
    </ContentSidebar>;
};
