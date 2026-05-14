import React from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Input } from "reactstrap";
import { useDeviceSize, above } from "../../../services";
import { formatISODateOnly } from "../DateString";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation()
    const { manageQuizzesTitleFilter, setManageQuizzesTitleFilter, quizStartDate, setQuizStartDate,
        quizSetDateFilterType, setQuizSetDateFilterType, quizDueDate, setQuizDueDate, quizDueDateFilterType,
        setQuizDueDateFilterType, manageQuizzesGroupNameFilter, setManageQuizzesGroupNameFilter, ...rest} = props;

    const deviceSize = useDeviceSize();

    const dateFilterTypeSelector = (dateFilterType: string, setDateFilterType: React.Dispatch<React.SetStateAction<string>>) => <UncontrolledDropdown>
        <DropdownToggle className="bg-transparent border-0 px-2" color="dropdown" caret>{dateFilterType}</DropdownToggle>
        <DropdownMenu>
            <DropdownItem onClick={() => setDateFilterType('after')}>
                after
            </DropdownItem>
            <DropdownItem onClick={() => setDateFilterType('before')}>
                before
            </DropdownItem>
            <DropdownItem onClick={() => setDateFilterType('on')}>
                on
            </DropdownItem>
        </DropdownMenu>
    </UncontrolledDropdown>;

    return <ContentSidebar buttonTitle="Search & Filter" {...rest}>
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h5>{t('searchTests', 'Search tests')}</h5>
            <Input
                id="manage-quizzes-title-filter" type="search"
                value={manageQuizzesTitleFilter} onChange={event => setManageQuizzesTitleFilter(event.target.value)}
                className="search--filter-input mt-3 mb-4"
                placeholder={t('egPractice', 'e.g. Practice')} aria-label={t('searchByTitle', 'Search by title')}
            />
            <h5>{t('searchByGroup', 'Search by group')}</h5>
            <Input
                id="manage-quizzes-group-name-filter" type="search"
                value={manageQuizzesGroupNameFilter} onChange={event => setManageQuizzesGroupNameFilter(event.target.value)}
                className="search--filter-input my-3"
                placeholder={t('groupName', 'Group name')}  aria-label={t('searchByGroup', 'Search by group')}
            />
            <div className="section-divider"/>
            <h5>{t('filterByDate', 'Filter by date')}</h5>
            <div className="d-flex align-items-center">
                <span className="quiz-filter-date-span">{t('starting', 'Starting')}</span>
                {dateFilterTypeSelector(quizSetDateFilterType, setQuizSetDateFilterType)}
            </div>
            <Input
                id="manage-quizzes-set-date-filter" type="date" className="quiz-filter-date-input"
                value={quizStartDate && !isNaN(quizStartDate.valueOf()) ? formatISODateOnly(quizStartDate) : undefined} onChange={event => setQuizStartDate(new Date(event.target.value))}
                placeholder={t('filterBySetDate', 'Filter by set date')} aria-label={t('filterBySetDate', 'Filter by set date')}
            />
            <div className="d-flex align-items-center mt-2">
                <span className="quiz-filter-date-span">{t('due', 'Due')}</span>
                {dateFilterTypeSelector(quizDueDateFilterType, setQuizDueDateFilterType)}
            </div>
            <Input
                id="manage-quizzes-due-date-filter" type="date" className="quiz-filter-date-input"
                value={quizDueDate && !isNaN(quizDueDate.valueOf()) ? formatISODateOnly(quizDueDate) : undefined} onChange={event => setQuizDueDate(new Date(event.target.value))}
                placeholder={t('filterByDueDate', 'Filter by due date')} aria-label={t('filterByDueDate', 'Filter by due date')}
            />
        </search>
    </ContentSidebar>;
};