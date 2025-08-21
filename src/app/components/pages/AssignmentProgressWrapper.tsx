import React, { useContext } from "react";
import {useGetGroupsQuery, useGetMySetAssignmentsQuery} from "../../state";
import sortBy from "lodash/sortBy";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {RouteComponentProps, withRouter} from "react-router-dom";
import { AssignmentProgressGroupsListing } from "./AssignmentProgressGroupsListing";
import { GroupSortOrder, useAssignmentProgressAccessibilitySettings } from "../../services";
import { AssignmentProgressGroup } from "./AssignmentProgressGroup";
import { AssignmentProgressPageSettingsContext } from "../../../IsaacAppTypes";
import { SingleAssignmentProgress } from "./SingleAssignmentProgress";

// This exists as a wrapper around all assignment progress pages, as a way of providing the group from `getGroupsQuery` while not requesting this several times
function AssignmentProgressType({user, assignmentId, groupId}: {user: RegisteredUserDTO, assignmentId?: string, groupId?: string}) {
    const {data: groups} = useGetGroupsQuery(false);
    const {data: assignments} = useGetMySetAssignmentsQuery(undefined); // used to find the group ID from the assignment ID on Individual pages
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    if (groupId) {
        // then we are in Group view
        const currentGroup = groupId ? parseInt(groupId) : undefined;
        const group = groups?.find(g => g.id === currentGroup);

        return <AssignmentProgressGroup user={user} group={group} />;
    }

    if (assignmentId) {
        // then we are on Individual Assignment view
        const assignment = assignments?.find(a => a.id === parseInt(assignmentId));
        const group = groups?.find(g => g.id === assignment?.groupId);

        return <SingleAssignmentProgress user={user} group={group} />;
    }

    // otherwise we are on Group Listing view
    const sortedGroups = pageSettings?.groupSortOrder === GroupSortOrder.Alphabetical
        ? sortBy(groups, g => g.groupName && g.groupName.toLowerCase())
        : sortBy(groups, g => g.created).reverse();

    return <AssignmentProgressGroupsListing user={user} groups={sortedGroups} />;
}

interface AssignmentProgressProps extends RouteComponentProps<{assignmentId?: string, groupId?: string}> {
    user: RegisteredUserDTO;
}
export const AssignmentProgress = withRouter((props: AssignmentProgressProps) => {
    const {user, match} = props;
    const pageSettings = useAssignmentProgressAccessibilitySettings({user});

    return <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
        <AssignmentProgressType user={user} assignmentId={match.params.assignmentId} groupId={match.params.groupId} />;
    </AssignmentProgressPageSettingsContext.Provider>;
});
