import React from "react";
import { RegisteredUserDTO } from "../../../../IsaacApiTypes";
import { AppGroup } from "../../../../IsaacAppTypes";
import { GroupSelector } from "../../pages/Groups";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const { user, groups, allGroups, selectedGroup, setSelectedGroupId, showArchived, setShowArchived, ...rest } = props;
    return <ContentSidebar buttonTitle={t("common:groups.sidebar.title")} {...rest}>
        <div className="section-divider"/>
        <h3 className="h5">{t("common:groups.sidebar.title")}</h3>
        <GroupSelector user={user} groups={groups} allGroups={allGroups} selectedGroup={selectedGroup} setSelectedGroupId={setSelectedGroupId} showArchived={showArchived}
            setShowArchived={setShowArchived} showCreateGroup={true} sidebarStyle={true}/>
    </ContentSidebar>;
};
