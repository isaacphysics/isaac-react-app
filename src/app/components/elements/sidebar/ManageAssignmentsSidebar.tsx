import { ContentSidebar } from "../layout/SidebarLayout";
import { above, isTeacherOrAbove, Item, itemise, reactSelectDarkModeStyles, selectOnChange, useDeviceSize } from "../../../services";
import { sortBy } from "lodash";
import React from "react";
import { Button, ButtonGroup, Input } from "reactstrap";
import { AssignmentDTO } from "../../../../IsaacApiTypes";
import { AppGroup } from "../../../../IsaacAppTypes";
import { StyledSelect } from "../inputs/StyledSelect";
import { selectors, useAppSelector } from "../../../state";
import i18next from "i18next";

interface HeaderProps {
    assignmentsSetByMe?: AssignmentDTO[];
    viewBy: "startDate" | "dueDate";
    setViewBy: (vb: "startDate" | "dueDate") => void;
    groupsToInclude: Item<number>[];
    setGroupsToInclude: (groups: Item<number>[]) => void;
    workTypesToInclude: Item<string>[];
    setWorkTypesToInclude: (types: Item<string>[]) => void;
    subjectsToInclude: Item<string>[];
    setSubjectsToInclude: (subjects: Item<string>[]) => void;
    workTitleToInclude: string;
    setWorkTitleToInclude: (title: string) => void;
    groups?: AppGroup[];
    collapse: () => void;
} 

export const ManageAssignmentsSidebar = ({groups, assignmentsSetByMe, viewBy, setViewBy, setGroupsToInclude, groupsToInclude, workTypesToInclude, setWorkTypesToInclude, workTitleToInclude, setWorkTitleToInclude, collapse}: HeaderProps) => {
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();

    return <ContentSidebar buttonTitle={i18next.t("common:assignments.manageSidebar.title")}>
        <div className="section-divider" />

        {assignmentsSetByMe && assignmentsSetByMe.length > 0 && <>
            <h5>{i18next.t("common:assignments.manageSidebar.dateShownLabel")}</h5>
            <ButtonGroup className={"w-100"}>
                <Button size={above["lg"](deviceSize) ? "md" : "sm"} className={"border-end-0 px-1 px-lg-3"} id={"start-date-button"}
                    color={viewBy === "startDate" ? "solid" : "keyline"}
                    onClick={() => setViewBy("startDate")}
                >
                    {i18next.t("common:assignments.manageSidebar.startDateOption")}
                </Button>
                <Button size={above["lg"](deviceSize) ? "md" : "sm"} className={"border-start-0 px-1 px-lg-3"} id={"due-date-button"}
                    color={viewBy === "dueDate" ? "solid" : "keyline"}
                    onClick={() => setViewBy("dueDate")}
                >
                    {i18next.t("common:assignments.manageSidebar.dueDateOption")}
                </Button>
            </ButtonGroup>
        </>}

        <div className="section-divider" />

        <h5>{i18next.t("common:assignments.sidebar.filterGroup")}</h5>
        <StyledSelect inputId="groups-filter" isMulti isClearable placeholder={i18next.t("common:sidebar.filter.all")}
            value={groupsToInclude}
            onChange={selectOnChange(setGroupsToInclude, false)}
            options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
            styles={reactSelectDarkModeStyles}
        />

        {isTeacherOrAbove(user) && <>
            <h5 className="mt-3">{i18next.t("common:assignments.manageSidebar.filterByWorkTypeLabel")}</h5>
            <StyledSelect inputId="work-types-filter" isMulti isClearable placeholder={i18next.t("common:sidebar.filter.all")}
                value={workTypesToInclude}
                onChange={selectOnChange(setWorkTypesToInclude, false)}
                options={["assignment", "test"].map(t => itemise(t, t.charAt(0).toUpperCase() + t.slice(1)))}
                styles={reactSelectDarkModeStyles}
            />
        </>}

        <h5 className="mt-3">{i18next.t("common:assignments.manageSidebar.filterByTitleLabel")}</h5>
        <Input type="text" placeholder={i18next.t("common:assignments.manageSidebar.searchTitlePlaceholder")} value={workTitleToInclude} onChange={e => setWorkTitleToInclude(e.target.value)} />
        {/* TODO swap the above title filter with the below filters pair, once subject information is available for assignments */}
        {/* <details>
            <summary className="mt-3">More filters</summary>

            <h5 className="mt-3">Filter by title</h5>
            <Input type="text" placeholder="Search by title" value={workTitleToInclude} onChange={e => setWorkTitleToInclude(e.target.value)} />

            <h5 className="mt-3">Filter by subject</h5>
            <StyledSelect inputId="subjects-filter" isMulti isClearable placeholder="All"
                value={subjectsToInclude}
                onChange={selectOnChange(setSubjectsToInclude, false)}
                options={Subjects.map(s => itemise(s, s.charAt(0).toUpperCase() + s.slice(1)))}
                styles={reactSelectDarkModeStyles}
            />
        </details> */}


        <div className="section-divider" />

        <Button onClick={collapse}>
            {i18next.t("common:assignments.manageSidebar.collapseButton")}
        </Button>
    </ContentSidebar>;
};
