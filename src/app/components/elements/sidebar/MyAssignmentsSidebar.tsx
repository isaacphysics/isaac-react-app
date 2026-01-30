import classNames from "classnames";
import React, { useEffect, ChangeEvent, useState } from "react";
import { Input } from "reactstrap";
import { AssignmentDTO } from "../../../../IsaacApiTypes";
import { MyAssignmentsOrder } from "../../../../IsaacAppTypes";
import { filterAssignmentsByStatus, getSearchPlaceholder, ASSIGNMENT_STATE_MAP, getDistinctAssignmentGroups, getDistinctAssignmentSetters } from "../../../services";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { AssignmentState } from "../../pages/MyAssignments";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { StyledTabPicker } from "../inputs/StyledTabPicker";

interface AssignmentStatusCheckboxProps extends React.HTMLAttributes<HTMLLabelElement> {
    status: AssignmentState;
    statusFilter: AssignmentState[];
    setStatusFilter: React.Dispatch<React.SetStateAction<AssignmentState[]>>;
    count?: number;
}

const AssignmentStatusCheckbox = (props: AssignmentStatusCheckboxProps) => {
    const {status, statusFilter, setStatusFilter, count, ...rest} = props;
    return <StyledTabPicker
        id={status ?? ""} checkboxTitle={status}
        onInputChange={() => !statusFilter.includes(status) ? setStatusFilter(c => [...c.filter(s => s !== AssignmentState.ALL), status]) : setStatusFilter(c => c.filter(s => s !== status))}
        checked={statusFilter.includes(status)}
        count={count} {...rest}
    />;
};

const AssignmentStatusAllCheckbox = (props: Omit<AssignmentStatusCheckboxProps, "status">) => {
    const { statusFilter, setStatusFilter, count, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<AssignmentState[]>([]);
    return <StyledTabPicker
        id="all" checkboxTitle="All"
        onInputChange={(e) => {
            if (e.target.checked) {
                setPreviousFilters(statusFilter);
                setStatusFilter([AssignmentState.ALL]);
            } else {
                setStatusFilter(previousFilters);
            }
        }}
        checked={statusFilter.includes(AssignmentState.ALL)}
        count={count} {...rest}
    />;
};

interface MyAssignmentsSidebarProps extends ContentSidebarProps {
    statusFilter: AssignmentState[];
    setStatusFilter: React.Dispatch<React.SetStateAction<AssignmentState[]>>;
    titleFilter: string;
    setTitleFilter: React.Dispatch<React.SetStateAction<string>>;
    groupFilter: string;
    setGroupFilter: React.Dispatch<React.SetStateAction<string>>;
    setByFilter: string;
    setSetByFilter: React.Dispatch<React.SetStateAction<string>>;
    sortOrder: MyAssignmentsOrder;
    setSortOrder: React.Dispatch<React.SetStateAction<MyAssignmentsOrder>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assignmentQuery: any;
}

export const MyAssignmentsSidebar = (props: MyAssignmentsSidebarProps) => {
    const { statusFilter, setStatusFilter, titleFilter, setTitleFilter, groupFilter, setGroupFilter, setByFilter, setSetByFilter, sortOrder, setSortOrder, assignmentQuery, ...rest } = props;

    const ORDER_NAMES: {[key in MyAssignmentsOrder]: string} = {
        "startDate": "Start date (oldest first)",
        "-startDate": "Start date (recent first)",
        "dueDate": "Due date (soonest first)",
        "-dueDate": "Due date (latest first)",
        "attempted": "Attempted (lowest first)",
        "-attempted": "Attempted (highest first)",
        "correct": "Correctness (lowest first)",
        "-correct": "Correctness (highest first)",
    };

    useEffect(() => {
        if (statusFilter.length === 0) {
            setStatusFilter([AssignmentState.ALL]);
        }
    }, [statusFilter, setStatusFilter]);

    return <ContentSidebar {...rest} className={classNames(rest.className, "pt-0")}>
        <ShowLoadingQuery query={assignmentQuery} defaultErrorTitle="" thenRender={(assignments: AssignmentDTO[]) => {
            const myAssignments = filterAssignmentsByStatus(assignments);
            const assignmentCountByStatus = myAssignments && Object.fromEntries(Object.entries(myAssignments).map(([key, value]) => [key, value.length]));
            const totalAssignmentCount = Object.values(assignmentCountByStatus).reduce((a, b) => a + b, 0);
            return <>
                <div className="section-divider"/>
                <search data-testid="my-assignments-sidebar">
                    <h5>Search assignments</h5>
                    <Input
                        className='search--filter-input my-3'
                        type="search" value={titleFilter || ""}
                        placeholder={`e.g. ${getSearchPlaceholder()}`}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleFilter(e.target.value)}
                    />
                    <div className="section-divider"/>
                    <h5>Sort</h5>
                    <Input type="select" className="ps-3 my-3" value={sortOrder} onChange={e => setSortOrder(e.target.value as MyAssignmentsOrder)}>
                        {Object.values(MyAssignmentsOrder).map(order => <option key={order} value={order}>{ORDER_NAMES[order]}</option>)}
                    </Input>
                    <div className="section-divider"/>
                    <h5 className="mb-4">Filter by status</h5>
                    <ul>
                        <li><AssignmentStatusAllCheckbox statusFilter={statusFilter} setStatusFilter={setStatusFilter} count={totalAssignmentCount}/></li>
                        <div className="section-divider-small"/>
                        {Object.values(AssignmentState).filter(s => s !== AssignmentState.ALL).map(state => <li key={state}>
                            <AssignmentStatusCheckbox status={state} count={assignmentCountByStatus[ASSIGNMENT_STATE_MAP[state]]} statusFilter={statusFilter} setStatusFilter={setStatusFilter}/>
                        </li>)}
                    </ul>
                    <h5 className="mt-4 mb-3">Filter by group</h5>
                    <Input type="select" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
                        {["All", ...getDistinctAssignmentGroups(assignments)].map(group => <option key={group} value={group}>{group}</option>)}
                    </Input>
                    <h5 className="mt-4 mb-3">Filter by assigner</h5>
                    <Input type="select" value={setByFilter} onChange={e => setSetByFilter(e.target.value)}>
                        {["All", ...getDistinctAssignmentSetters(assignments)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                    </Input>
                </search>
            </>;
        }}/>
    </ContentSidebar>;
};
