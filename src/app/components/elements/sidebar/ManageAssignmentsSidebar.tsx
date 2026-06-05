import { ContentSidebar } from "../layout/SidebarLayout";
import { above, isStaff, Item, itemise, selectOnChange, useDeviceSize } from "../../../services";
import { sortBy } from "lodash";
import React from "react";
import { Button, ButtonGroup } from "reactstrap";
import { AssignmentDTO, RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { AppGroup } from "../../../../IsaacAppTypes";
import { StyledSelect } from "../inputs/StyledSelect";

interface HeaderProps {
    assignmentsSetByMe?: AssignmentDTO[];
    viewBy: "startDate" | "dueDate";
    setViewBy: (vb: "startDate" | "dueDate") => void;
    groupsToInclude: Item<number>[];
    setGroupsToInclude: (groups: Item<number>[]) => void;
    workTypesToInclude: Item<string>[];
    setWorkTypesToInclude: (types: Item<string>[]) => void;
    groups?: AppGroup[];
    user: RegisteredUserDTO;
    collapse: () => void;
}

export const ManageAssignmentsSidebar = ({user, groups, assignmentsSetByMe, viewBy, setViewBy, setGroupsToInclude, groupsToInclude, workTypesToInclude, setWorkTypesToInclude, collapse}: HeaderProps) => {

    const deviceSize = useDeviceSize();

    return <ContentSidebar buttonTitle="Filter & sort">
        <div className="section-divider" />
        <h5>Filter by group</h5>
        <StyledSelect inputId="groups-filter" isMulti isClearable placeholder="All"
            value={groupsToInclude}
            closeMenuOnSelect={!isStaff(user)}
            onChange={selectOnChange(setGroupsToInclude, false)}
            options={sortBy(groups, group => group.groupName && group.groupName.toLowerCase()).map(g => itemise(g.id as number, g.groupName))}
        />

        <h5 className="mt-3">Filter by type</h5>
        <StyledSelect inputId="work-types-filter" isMulti isClearable placeholder="All"
            value={workTypesToInclude}
            closeMenuOnSelect={!isStaff(user)}
            onChange={selectOnChange(setWorkTypesToInclude, false)}
            options={["assignment", "test"].map(t => itemise(t, t.charAt(0).toUpperCase() + t.slice(1)))}
        />

        <div className="section-divider" />

        {assignmentsSetByMe && assignmentsSetByMe.length > 0 && <>
            <h5>Date shown</h5>
            <ButtonGroup className={"w-100"}>
                <Button size={above["lg"](deviceSize) ? "md" : "sm"} className={"border-end-0 px-1 px-lg-3"} id={"start-date-button"}
                    color={viewBy === "startDate" ? "solid" : "keyline"}
                    onClick={() => setViewBy("startDate")}
                >
                    Start date
                </Button>
                <Button size={above["lg"](deviceSize) ? "md" : "sm"} className={"border-start-0 px-1 px-lg-3"} id={"due-date-button"}
                    color={viewBy === "dueDate" ? "solid" : "keyline"}
                    onClick={() => setViewBy("dueDate")}
                >
                    Due date
                </Button>
            </ButtonGroup>
        </>}

        <div className="section-divider" />

        <Button onClick={collapse}>
            Collapse schedule
        </Button>
    </ContentSidebar>;
};
