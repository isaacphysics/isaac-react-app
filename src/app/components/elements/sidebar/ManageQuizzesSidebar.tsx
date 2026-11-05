import React from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Input } from "reactstrap";
import { useDeviceSize, above } from "../../../services";
import { formatISODateOnly } from "../DateString";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { SearchInputWithIcon } from "../SearchInputs";
import { useTranslation } from "react-i18next";

interface ManageQuizzesSidebarProps extends ContentSidebarProps {
    manageQuizzesTitleFilter: string;
    setManageQuizzesTitleFilter: React.Dispatch<React.SetStateAction<string>>;
    quizStartDate: Date | undefined;
    setQuizStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    quizSetDateFilterType: string;
    setQuizSetDateFilterType: React.Dispatch<React.SetStateAction<string>>;
    quizDueDate: Date | undefined;
    setQuizDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
    quizDueDateFilterType: string;
    setQuizDueDateFilterType: React.Dispatch<React.SetStateAction<string>>;
    manageQuizzesGroupNameFilter: string;
    setManageQuizzesGroupNameFilter: React.Dispatch<React.SetStateAction<string>>;
};

export const ManageQuizzesSidebar = (props: ManageQuizzesSidebarProps) => {
    const { t } = useTranslation();
    const { manageQuizzesTitleFilter, setManageQuizzesTitleFilter, quizStartDate, setQuizStartDate,
        quizSetDateFilterType, setQuizSetDateFilterType, quizDueDate, setQuizDueDate, quizDueDateFilterType,
        setQuizDueDateFilterType, manageQuizzesGroupNameFilter, setManageQuizzesGroupNameFilter, ...rest} = props;

    const deviceSize = useDeviceSize();

    const dateFilterTypeSelector = (dateFilterType: string, setDateFilterType: React.Dispatch<React.SetStateAction<string>>) => <UncontrolledDropdown>
        <DropdownToggle className="bg-transparent border-0 px-2" color="dropdown" caret>{dateFilterType}</DropdownToggle>
        <DropdownMenu>
            <DropdownItem onClick={() => setDateFilterType('after')}>
                {t("ada:tests.filters.after")}
            </DropdownItem>
            <DropdownItem onClick={() => setDateFilterType('before')}>
                {t("ada:tests.filters.before")}
            </DropdownItem>
            <DropdownItem onClick={() => setDateFilterType('on')}>
                {t("ada:tests.filters.on")}
            </DropdownItem>
        </DropdownMenu>
    </UncontrolledDropdown>;

    return <ContentSidebar buttonTitle={t("common:button.searchAndFilter")} {...rest}>
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h3 className="h5">{t("common:title.searchTests")}</h3>
            <SearchInputWithIcon
                outerClassName="mt-3 mb-4"
                id="manage-quizzes-title-filter" type="search"
                value={manageQuizzesTitleFilter} onChange={event => setManageQuizzesTitleFilter(event.target.value)}
                placeholder={t("common:tests.search.placeholder")} aria-label={t("common:label.searchByTitle")}
            />
            <h3 className="h5">{t("common:tests.filters.searchGroupLabel")}</h3>
            <SearchInputWithIcon
                outerClassName="my-3"
                id="manage-quizzes-group-name-filter" type="search"
                value={manageQuizzesGroupNameFilter} onChange={event => setManageQuizzesGroupNameFilter(event.target.value)}
                placeholder={t("common:label.groupName")}  aria-label={t("common:tests.filters.searchGroupLabel")}
            />
            <div className="section-divider"/>
            <h3 className="h5">{t("common:tests.filters.dateSectionTitle")}</h3>
            <div className="d-flex align-items-center">
                <span className="quiz-filter-date-span">{t("ada:tests.filters.startDateLabel")}</span>
                {dateFilterTypeSelector(quizSetDateFilterType, setQuizSetDateFilterType)}
            </div>
            <Input
                id="manage-quizzes-set-date-filter" type="date" className="quiz-filter-date-input"
                value={quizStartDate && !isNaN(quizStartDate.valueOf()) ? formatISODateOnly(quizStartDate) : undefined} onChange={event => setQuizStartDate(new Date(event.target.value))}
                placeholder={t("ada:tests.filters.filterBySetDate")} aria-label={t("ada:tests.filters.filterBySetDate")}
            />
            <div className="d-flex align-items-center mt-2">
                <span className="quiz-filter-date-span">{t("ada:tests.filters.dueDateLabel")}</span>
                {dateFilterTypeSelector(quizDueDateFilterType, setQuizDueDateFilterType)}
            </div>
            <Input
                id="manage-quizzes-due-date-filter" type="date" className="quiz-filter-date-input"
                value={quizDueDate && !isNaN(quizDueDate.valueOf()) ? formatISODateOnly(quizDueDate) : undefined} onChange={event => setQuizDueDate(new Date(event.target.value))}
                placeholder={t("ada:tests.filters.filterByDueDate")} aria-label={t("ada:tests.filters.filterByDueDate")}
            />
        </search>
    </ContentSidebar>;
};
