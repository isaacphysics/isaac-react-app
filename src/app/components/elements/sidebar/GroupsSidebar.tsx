import React from "react";
import { RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { AppGroup } from "../../../../IsaacAppTypes";
import { GroupSelector } from "../../pages/Groups";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";

interface GroupsSidebarProps extends ContentSidebarProps {
    user: RegisteredUserDTO;
    groups: AppGroup[] | undefined;
    allGroups: AppGroup[];
    selectedGroup: AppGroup | undefined;
    setSelectedGroupId: React.Dispatch<React.SetStateAction<number | undefined>>;
    showArchived: boolean;
    setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GroupsSidebar = (props: GroupsSidebarProps) => {
    const { user, groups, allGroups, selectedGroup, setSelectedGroupId, showArchived, setShowArchived, ...rest } = props;
    return <ContentSidebar buttonTitle="Select or create a group" {...rest}>
        <div className="section-divider"/>
        <h5>Select or create a group</h5>
        <GroupSelector user={user} groups={groups} allGroups={allGroups} selectedGroup={selectedGroup} setSelectedGroupId={setSelectedGroupId} showArchived={showArchived}
            setShowArchived={setShowArchived} showCreateGroup={true} sidebarStyle={true}/>
    </ContentSidebar>;
};
