import React from "react";
import { Input } from "reactstrap";
import { useDeviceSize, above } from "../../../services";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { SearchInputWithIcon } from "../SearchInputs";

interface SetQuizzesSidebarProps extends ContentSidebarProps {
    titleFilter?: string;
    setTitleFilter: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const SetQuizzesSidebar = (props: SetQuizzesSidebarProps) => {
    const { titleFilter, setTitleFilter, ...rest } = props;
    const deviceSize = useDeviceSize();

    return <ContentSidebar buttonTitle="Search tests" {...rest}>
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h5>Search tests</h5>
            <SearchInputWithIcon
                outerClassName="my-3"
                id="available-quizzes-title-filter" type="search"
                value={titleFilter} onChange={event => setTitleFilter(event.target.value)}
                placeholder="e.g. Practice"
            />
        </search>
    </ContentSidebar>;
};
