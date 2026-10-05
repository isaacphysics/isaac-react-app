import classNames from "classnames";
import React, { useEffect, ChangeEvent, useState } from "react";
import { Input } from "reactstrap";
import { AssignmentDTO } from "../../../../IsaacApiTypes";
import { MyAssignmentsOrder } from "../../../../IsaacAppTypes";
import { filterAssignmentsByStatus, getSearchPlaceholder, ASSIGNMENT_STATE_MAP, getDistinctAssignmentGroups, getDistinctAssignmentSetters } from "../../../services";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { AssignmentState } from "../../pages/MyAssignments";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { StyledTabPicker, StyledTabPickerProps } from "../inputs/StyledTabPicker";
import { SearchInputWithIcon } from "../SearchInputs";
import { useTranslation } from "react-i18next";

type AssignmentStatusCheckboxProps = Partial<StyledTabPickerProps> & {
    status: AssignmentState;
    statusFilter: AssignmentState[];
    setStatusFilter: React.Dispatch<React.SetStateAction<AssignmentState[]>>;
    count?: number;
}

const AssignmentStatusCheckbox = (props: AssignmentStatusCheckboxProps) => {
    const {status, statusFilter, setStatusFilter, count, ...rest} = props;
    return <StyledTabPicker
        {...rest}
        type="checkbox" to={undefined}
        id={status ?? ""} checkboxTitle={status}
        onChange={() => !statusFilter.includes(status) ? setStatusFilter(c => [...c.filter(s => s !== AssignmentState.ALL), status]) : setStatusFilter(c => c.filter(s => s !== status))}
        checked={statusFilter.includes(status)}
        count={count}
    />;
};

const AssignmentStatusAllCheckbox = (props: Omit<AssignmentStatusCheckboxProps, "status">) => {
    const { t } = useTranslation();
    const { statusFilter, setStatusFilter, count, ...rest } = props;
    const [previousFilters, setPreviousFilters] = useState<AssignmentState[]>([]);
    return <StyledTabPicker
        {...rest}
        type="checkbox" to={undefined}
        id="all" checkboxTitle={t("common:sidebar.filter.all")}
        onChange={(e) => {
            if (e.target.checked) {
                setPreviousFilters(statusFilter);
                setStatusFilter([AssignmentState.ALL]);
            } else {
                setStatusFilter(previousFilters);
            }
        }}
        checked={statusFilter.includes(AssignmentState.ALL)}
        count={count}
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
    const { t } = useTranslation();
    const { statusFilter, setStatusFilter, titleFilter, setTitleFilter, groupFilter, setGroupFilter, setByFilter, setSetByFilter, sortOrder, setSortOrder, assignmentQuery, ...rest } = props;

    const ORDER_NAMES: {[key in MyAssignmentsOrder]: string} = {
        "startDate": t("common:assignments.sidebar.sortStartDateOldest"),
        "-startDate": t("common:assignments.sidebar.sortStartDateNewest"),
        "dueDate": t("common:assignments.sidebar.sortDueDateSoonest"),
        "-dueDate": t("common:assignments.sidebar.sortDueDateLatest"),
        "attempted": t("common:assignments.sidebar.sortAttemptedLowest"),
        "-attempted": t("common:assignments.sidebar.sortAttemptedHighest"),
        "correct": t("common:assignments.sidebar.sortCorrectnessLowest"),
        "-correct": t("common:assignments.sidebar.sortCorrectnessHighest"),
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
                    <h5>{t("common:assignments.sidebar.searchTitle")}</h5>
                    <SearchInputWithIcon
                        outerClassName='my-3'
                        type="search" value={titleFilter || ""}
                        placeholder={`e.g. ${getSearchPlaceholder()}`}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleFilter(e.target.value)}
                    />
                    <div className="section-divider"/>
                    <h5>{t("common:assignments.sidebar.sortTitle")}</h5>
                    <Input type="select" className="ps-3 my-3" value={sortOrder} onChange={e => setSortOrder(e.target.value as MyAssignmentsOrder)}>
                        {Object.values(MyAssignmentsOrder).map(order => <option key={order} value={order}>{ORDER_NAMES[order]}</option>)}
                    </Input>
                    <div className="section-divider"/>
                    <h5 className="mb-4">{t("common:sidebar.filter.status")}</h5>
                    <ul>
                        <li><AssignmentStatusAllCheckbox statusFilter={statusFilter} setStatusFilter={setStatusFilter} count={totalAssignmentCount}/></li>
                        <div className="section-divider-small"/>
                        {Object.values(AssignmentState).filter(s => s !== AssignmentState.ALL).map(state => <li key={state}>
                            <AssignmentStatusCheckbox status={state} count={assignmentCountByStatus[ASSIGNMENT_STATE_MAP[state]]} statusFilter={statusFilter} setStatusFilter={setStatusFilter}/>
                        </li>)}
                    </ul>
                    <h5 className="mt-4 mb-3">{t("common:assignments.sidebar.filterGroup")}</h5>
                    <Input type="select" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
                        {["All", ...getDistinctAssignmentGroups(assignments)].map(group => <option key={group} value={group}>{group}</option>)}
                    </Input>
                    <h5 className="mt-4 mb-3">{t("common:sidebar.filter.assigner")}</h5>
                    <Input type="select" value={setByFilter} onChange={e => setSetByFilter(e.target.value)}>
                        {["All", ...getDistinctAssignmentSetters(assignments)].map(setter => <option key={setter} value={setter}>{setter}</option>)}
                    </Input>
                </search>
            </>;
        }}/>
    </ContentSidebar>;
};
