import React, { useState } from "react";
import { Input } from "reactstrap";
import { QuizAssignmentDTO } from "../../../../IsaacApiTypes";
import { QuizStatus, useDeviceSize, above, getDistinctAssignmentSetters } from "../../../services";
import { useGetQuizAssignmentsAssignedToMeQuery } from "../../../state";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { StyledDropdown } from "../inputs/DropdownInput";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { StyledTabPicker, StyledTabPickerProps } from "../inputs/StyledTabPicker";
import { SearchInputWithIcon } from "../SearchInputs";
import { useTranslation } from "react-i18next";

type QuizStatusCheckboxProps = Partial<StyledTabPickerProps> & {
    status: QuizStatus;
    statusFilter: QuizStatus[];
    setStatusFilter: React.Dispatch<React.SetStateAction<QuizStatus[]>>;
    count?: number;
}

const QuizStatusCheckbox = (props: QuizStatusCheckboxProps) => {
    const {status, statusFilter, setStatusFilter, count, ...rest} = props;
    return <StyledTabPicker
        {...rest}
        type="checkbox" to={undefined}
        id={status ?? ""} checkboxTitle={status}
        onChange={() => !statusFilter.includes(status) ? setStatusFilter(c => [...c.filter(s => s !== QuizStatus.All), status]) : setStatusFilter(c => c.filter(s => s !== status))}
        checked={statusFilter.includes(status)}
        count={count}
    />;
};

const QuizStatusAllCheckbox = (props: Omit<QuizStatusCheckboxProps, "status" | "checkboxTitle">) => {
    const { t } = useTranslation();
    const { statusFilter, setStatusFilter, count, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<QuizStatus[]>([]);
    return <StyledTabPicker
        {...rest}
        type="checkbox" to={undefined}
        id="all" checkboxTitle={t("common:sidebar.filter.all")}
        onChange={(e) => {
            if (e.target.checked) {
                setPreviousFilters(statusFilter);
                setStatusFilter([QuizStatus.All]);
            } else {
                setStatusFilter(previousFilters);
            }
        }}
        checked={statusFilter.includes(QuizStatus.All)}
        count={count}
    />;
};

interface MyQuizzesSidebarProps extends ContentSidebarProps {
    setQuizTitleFilter: (title: string) => void;
    setQuizCreatorFilter: (creator: string) => void;
    quizStatusFilter: QuizStatus[];
    setQuizStatusFilter: React.Dispatch<React.SetStateAction<QuizStatus[]>>;
    activeTab: number;
    displayMode: "table" | "cards";
    setDisplayMode: React.Dispatch<React.SetStateAction<"table" | "cards">>;
};

export const MyQuizzesSidebar = (props: MyQuizzesSidebarProps) => {
    const { t } = useTranslation();
    const { setQuizTitleFilter,setQuizCreatorFilter, quizStatusFilter, setQuizStatusFilter, activeTab, displayMode, setDisplayMode, ...rest } = props;
    const deviceSize = useDeviceSize();
    const quizQuery = useGetQuizAssignmentsAssignedToMeQuery();

    const statusOptions = activeTab === 1 ? Object.values(QuizStatus).filter(s => s !== QuizStatus.All)
        : [QuizStatus.Started, QuizStatus.Complete];

    return <ContentSidebar buttonTitle={t("common:tests.sidebar.searchFilterButton")} {...rest}>
        <ShowLoadingQuery query={quizQuery} defaultErrorTitle="" thenRender={(quizzes: QuizAssignmentDTO[]) => {
            return <>
                {above["lg"](deviceSize) && <div className="section-divider"/>}
                <search>
                    <h5>{t("common:tests.sidebar.searchTitle")}</h5>
                    <SearchInputWithIcon 
                        outerClassName="my-3" 
                        type="search" 
                        onChange={(e) => setQuizTitleFilter(e.target.value)}
                        placeholder={t("common:tests.search.placeholder")} aria-label={t("common:tests.sidebar.searchAriaLabel")}
                    />
                    <div className="section-divider"/>
                    <h5 className="mb-3">{t("common:sidebar.filter.status")}</h5>
                    <ul>
                        <li><QuizStatusAllCheckbox statusFilter={quizStatusFilter} setStatusFilter={setQuizStatusFilter} count={undefined}/></li>
                        <div className="section-divider-small"/>
                        {statusOptions.map(state => <li key={state}>
                            <QuizStatusCheckbox status={state} count={undefined} statusFilter={quizStatusFilter} setStatusFilter={setQuizStatusFilter}/>
                        </li>)}
                    </ul>
                    {activeTab === 1 && <>
                        <h5 className="my-3">{t("common:sidebar.filter.assigner")}</h5>
                        <Input type="select" onChange={e => setQuizCreatorFilter(e.target.value)}>
                            {["All", ...getDistinctAssignmentSetters(quizzes)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                        </Input>
                    </>}
                    <div className="section-divider mt-4"/>
                    <h5 className="mb-3">{t("common:sidebar.display.title")}</h5>
                    <StyledDropdown value={displayMode} onChange={() => setDisplayMode(d => d === "table" ? "cards" : "table")}>
                        <option value="table">{t("common:tests.sidebar.displayTableOption")}</option>
                        <option value="cards">{t("common:tests.sidebar.displayCardOption")}</option>
                    </StyledDropdown>
                </search>
            </>;
        }}/>
    </ContentSidebar>;
};
