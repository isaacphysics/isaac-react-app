import React from "react";
import {useGetGroupsQuery} from "../../state";
import sortBy from "lodash/sortBy";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {useLocation} from "react-router-dom";
import { AssignmentProgressGroupsListing } from "./AssignmentProgressGroupsListing";
import { GroupSortOrder, isDefined, useAssignmentProgressAccessibilitySettings } from "../../services";
import { AssignmentProgressGroup } from "./AssignmentProgressGroup";
import { AssignmentProgressPageSettingsContext } from "../../../IsaacAppTypes";

// This exists as a wrapper around both the groups listing and the individual group progress pages, as a way of
// providing the group from `getGroupsQuery` 
export function AssignmentProgress({user}: {user: RegisteredUserDTO}) {
    const {data: groups} = useGetGroupsQuery(false);
    const location = useLocation();

    const currentGroupIndex = location.pathname.split("/")[3];
    const currentGroup = currentGroupIndex ? parseInt(currentGroupIndex) : undefined;

    const pageSettings = useAssignmentProgressAccessibilitySettings({user});

    const sortedGroups = pageSettings.groupSortOrder === GroupSortOrder.Alphabetical
        ? sortBy(groups, g => g.groupName && g.groupName.toLowerCase())
        : sortBy(groups, g => g.created).reverse();

    return <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
        {isDefined(currentGroup)
            ? <AssignmentProgressGroup user={user} group={sortedGroups.find(group => group.id === currentGroup)} /> 
            : <AssignmentProgressGroupsListing user={user} groups={sortedGroups} />
        }
    </AssignmentProgressPageSettingsContext.Provider>;
}
