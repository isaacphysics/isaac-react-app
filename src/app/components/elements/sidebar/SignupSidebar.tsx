import React from "react";
import { useNavigate } from "react-router";
import { confirmThen } from "../../../services";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebar } from "../layout/SidebarLayout";
import { useTranslation } from "react-i18next";

export const SignupSidebar = ({activeTab, sso} : {activeTab: number, sso?: boolean}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const goBack = (path: string) => {
        confirmThen(
            t("common:auth.signup.goBackConfirm"),
            () => navigate(path)
        );
    };

    const handleSSOBack = (path: string) => {
        if (sso) {
            window.alert("Your age has already been verified by your SSO provider.");
        } else {
            goBack(path);
        }
    };

    return <ContentSidebar buttonTitle={t("common:auth.sidebar.title")}>
        <div className="section-divider mt-4"/>
        <h3 className="mt-1 h5">{t("common:auth.sidebar.title")}</h3>
        {/* Tabs are clickable iff their page could be reached with a Back button */}
        <StyledTabPicker checkboxTitle={t("common:auth.sidebar.tabMethod")} checked={activeTab === 0} disabled={activeTab > 2} onChange={() => (activeTab === 1 || activeTab === 2) && goBack("/register")}/>
        <StyledTabPicker checkboxTitle={t("common:auth.sidebar.tabAge")} checked={activeTab === 1} disabled={activeTab < 1 || activeTab > 2} onChange={() => activeTab === 2 && handleSSOBack("/register/student/age")}/>
        <StyledTabPicker checkboxTitle={t("common:auth.sidebar.tabDetails")} checked={activeTab === 2} disabled={activeTab !== 2} onChange={undefined}/>
        <StyledTabPicker checkboxTitle={t("common:auth.sidebar.tabGroup")} checked={activeTab === 4} disabled={activeTab !== 4} onChange={undefined}/>
        <StyledTabPicker checkboxTitle={t("common:auth.sidebar.tabPreferences")} checked={activeTab === 3} disabled={activeTab !== 3} onChange={undefined}/>
    </ContentSidebar>;
};
