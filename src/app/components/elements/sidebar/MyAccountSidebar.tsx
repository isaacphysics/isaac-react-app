import React from "react";
import { ContentSidebarContext } from "../../../../IsaacAppTypes";
import { ACCOUNT_TAB, ACCOUNT_TABS, ifKeyIsEnter } from "../../../services";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebar, SidebarProps } from "../layout/SidebarLayout";
import { useTranslation } from "react-i18next";

interface MyAccountSidebarProps extends SidebarProps {
    editingOtherUser: boolean;
    activeTab: ACCOUNT_TAB;
    setActiveTab: (tab: ACCOUNT_TAB) => void;
}

export const MyAccountSidebar = (props: MyAccountSidebarProps) => {
    const { t } = useTranslation();
    const { editingOtherUser, activeTab, setActiveTab, ...rest } = props;
    return <ContentSidebar buttonTitle={t("common:account.settings.title")} data-testid="account-nav" {...rest}>
        <div className="section-divider mt-0"/>
        <h5>{t("common:account.settings.title")}</h5>
        <ul>
            {ACCOUNT_TABS
                .filter(tab => !tab.hidden && !(editingOtherUser && tab.hiddenIfEditingOtherUser))
                .map(({tab, title}) => (
                    <li key={tab}>
                        <ContentSidebarContext.Consumer>
                            {(context) =>
                                <StyledTabPicker id={title} type="radio" tabIndex={0} checkboxTitle={title} checked={activeTab === tab}
                                    onChange={() => setActiveTab(tab)}
                                    onClick={() => context?.close()}
                                    onKeyDown={ifKeyIsEnter(() => context?.close())}
                                />
                            }
                        </ContentSidebarContext.Consumer>
                    </li>
                ))
            }
        </ul>
    </ContentSidebar>;
};
