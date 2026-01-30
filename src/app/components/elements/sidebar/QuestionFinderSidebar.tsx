import React, { useState, ChangeEvent } from "react";
import { Input } from "reactstrap";
import { getQuestionPlaceholder } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { QuestionFinderFilterPanelProps, QuestionFinderFilterPanel } from "../panels/QuestionFinderFilterPanel";

interface QuestionFinderSidebarProps extends ContentSidebarProps {
    searchText: string;
    setSearchText: (searchText: string) => void;
    questionFinderFilterPanelProps: QuestionFinderFilterPanelProps
}

export const QuestionFinderSidebar = (props: QuestionFinderSidebarProps) => {
    const { searchText, setSearchText, questionFinderFilterPanelProps, ...rest } = props;

    const pageContext = useAppSelector(selectors.pageContext.context);

    // setSearchText is a debounced method that would not update on each keystroke, so we use this internal state to visually update the search text immediately
    const [internalSearchText, setInternalSearchText] = useState(searchText);

    return <ContentSidebar {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Search questions</h5>
            <Input
                className='search--filter-input my-4'
                type="search" value={internalSearchText || ""}
                placeholder={`e.g. ${getQuestionPlaceholder(pageContext)}`}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setInternalSearchText(e.target.value);
                    setSearchText(e.target.value);
                }}
            />

            <QuestionFinderFilterPanel {...questionFinderFilterPanelProps} />
        </search>
    </ContentSidebar>;
};