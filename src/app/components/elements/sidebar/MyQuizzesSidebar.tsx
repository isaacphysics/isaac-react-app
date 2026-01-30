import React, { useState } from "react";
import { Input } from "reactstrap";
import { QuizAssignmentDTO } from "../../../../IsaacApiTypes";
import { QuizStatus, useDeviceSize, above, getDistinctAssignmentSetters } from "../../../services";
import { useGetQuizAssignmentsAssignedToMeQuery } from "../../../state";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { StyledDropdown } from "../inputs/DropdownInput";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { StyledTabPicker } from "../inputs/StyledTabPicker";

interface QuizStatusCheckboxProps extends React.HTMLAttributes<HTMLLabelElement> {
    status: QuizStatus;
    statusFilter: QuizStatus[];
    setStatusFilter: React.Dispatch<React.SetStateAction<QuizStatus[]>>;
    count?: number;
}

const QuizStatusCheckbox = (props: QuizStatusCheckboxProps) => {
    const {status, statusFilter, setStatusFilter, count, ...rest} = props;
    return <StyledTabPicker
        id={status ?? ""} checkboxTitle={status}
        onInputChange={() => !statusFilter.includes(status) ? setStatusFilter(c => [...c.filter(s => s !== QuizStatus.All), status]) : setStatusFilter(c => c.filter(s => s !== status))}
        checked={statusFilter.includes(status)}
        count={count} {...rest}
    />;
};

const QuizStatusAllCheckbox = (props: Omit<QuizStatusCheckboxProps, "status">) => {
    const { statusFilter, setStatusFilter, count, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<QuizStatus[]>([]);
    return <StyledTabPicker
        id="all" checkboxTitle="All"
        onInputChange={(e) => {
            if (e.target.checked) {
                setPreviousFilters(statusFilter);
                setStatusFilter([QuizStatus.All]);
            } else {
                setStatusFilter(previousFilters);
            }
        }}
        checked={statusFilter.includes(QuizStatus.All)}
        count={count} {...rest}
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
    const { setQuizTitleFilter,setQuizCreatorFilter, quizStatusFilter, setQuizStatusFilter, activeTab, displayMode, setDisplayMode, ...rest } = props;
    const deviceSize = useDeviceSize();
    const quizQuery = useGetQuizAssignmentsAssignedToMeQuery();

    const statusOptions = activeTab === 1 ? Object.values(QuizStatus).filter(s => s !== QuizStatus.All)
        : [QuizStatus.Started, QuizStatus.Complete];

    return <ContentSidebar buttonTitle="Search & Filter" {...rest}>
        <ShowLoadingQuery query={quizQuery} defaultErrorTitle="" thenRender={(quizzes: QuizAssignmentDTO[]) => {
            return <>
                {above["lg"](deviceSize) && <div className="section-divider"/>}
                <search>
                    <h5>Search tests</h5>
                    <Input type="search" className="search--filter-input my-3" onChange={(e) => setQuizTitleFilter(e.target.value)}
                        placeholder="e.g. Practice" aria-label="Search by title"/>
                    <div className="section-divider"/>
                    <h5 className="mb-3">Filter by status</h5>
                    <ul>
                        <li><QuizStatusAllCheckbox statusFilter={quizStatusFilter} setStatusFilter={setQuizStatusFilter} count={undefined}/></li>
                        <div className="section-divider-small"/>
                        {statusOptions.map(state => <li key={state}>
                            <QuizStatusCheckbox status={state} count={undefined} statusFilter={quizStatusFilter} setStatusFilter={setQuizStatusFilter}/>
                        </li>)}
                    </ul>
                    {activeTab === 1 && <>
                        <h5 className="my-3">Filter by assigner</h5>
                        <Input type="select" onChange={e => setQuizCreatorFilter(e.target.value)}>
                            {["All", ...getDistinctAssignmentSetters(quizzes)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                        </Input>
                    </>}
                    <div className="section-divider mt-4"/>
                    <h5 className="mb-3">Display</h5>
                    <StyledDropdown value={displayMode} onChange={() => setDisplayMode(d => d === "table" ? "cards" : "table")}>
                        <option value="table">Table View</option>
                        <option value="cards">Card View</option>
                    </StyledDropdown>
                </search>
            </>;
        }}/>
    </ContentSidebar>;
};