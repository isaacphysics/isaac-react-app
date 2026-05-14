import React from "react";
import { useNavigate } from "react-router";
import { confirmThen } from "../../../services";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebar } from "../layout/SidebarLayout";
import { useTranslation } from 'react-i18next'

export const SignupSidebar = ({activeTab} : {activeTab: number}) => {
    const { t } = useTranslation()
    const navigate = useNavigate();

    const goBack = (path: string) => {
        confirmThen(
            t('areYouSureYouWantGoBackAnyInformationYouHaveEnteredWillBeLost', 'Are you sure you want go back? Any information you have entered will be lost.'),
            () => navigate(path));
    };

    return <ContentSidebar buttonTitle="Create an account">
        <div className="section-divider mt-4"/>
        <h5 className="mt-1">{t('createAnAccount', 'Create an account')}</h5>
        {/* Tabs are clickable iff their page could be reached with a Back button */}
        <StyledTabPicker checkboxTitle={t('signupMethod', 'Sign-up method')} checked={activeTab === 0} disabled={activeTab > 2} onClick={() => (activeTab === 1 || activeTab === 2) && goBack("/register")}/>
        <StyledTabPicker checkboxTitle={t('ageVerification', 'Age verification')} checked={activeTab === 1} disabled={activeTab < 1 || activeTab > 2} onClick={() => activeTab === 2 && goBack("/age")}/>
        <StyledTabPicker checkboxTitle={t('accountDetails', 'Account details')} checked={activeTab === 2} disabled={activeTab !== 2}/>
        <StyledTabPicker checkboxTitle={t('joinAGroup2', 'Join a group')} checked={activeTab === 4} disabled={activeTab !== 4}/>
        <StyledTabPicker checkboxTitle={"Preferences"} checked={activeTab === 3} disabled={activeTab !== 3}/>
    </ContentSidebar>;
};
