import React from "react";
import { useDeviceSize, above } from "../../../services";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { SearchInputWithIcon } from "../SearchInputs";
import { useTranslation } from "react-i18next";

interface SetQuizzesSidebarProps extends ContentSidebarProps {
    titleFilter?: string;
    setTitleFilter: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const SetQuizzesSidebar = (props: SetQuizzesSidebarProps) => {
    const { t } = useTranslation();
    const { titleFilter, setTitleFilter, ...rest } = props;
    const deviceSize = useDeviceSize();

    return <ContentSidebar buttonTitle={t("common:tests.search.title")} {...rest}>
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h3 className="h5">{t("common:tests.search.title")}</h3>
            <SearchInputWithIcon
                outerClassName="my-3"
                id="available-quizzes-title-filter" type="search"
                value={titleFilter} onChange={event => setTitleFilter(event.target.value)}
                placeholder={t("common:tests.search.placeholder")}
            />
        </search>
    </ContentSidebar>;
};
