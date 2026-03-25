import React from "react";
import { ContentSidebarContext } from "../../../../IsaacAppTypes";
import { ACCOUNT_TAB, ACCOUNT_TABS, ifKeyIsEnter } from "../../../services";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebar, SidebarProps } from "../layout/SidebarLayout";

interface MyAccountSidebarProps extends SidebarProps {
    editingOtherUser: boolean;
    activeTab: ACCOUNT_TAB;
    setActiveTab: React.Dispatch<React.SetStateAction<ACCOUNT_TAB>>;
}

export const MyAccountSidebar = (props: MyAccountSidebarProps) => {
    const { editingOtherUser, activeTab, setActiveTab, ...rest } = props;
    return <ContentSidebar buttonTitle="Account settings" data-testid="account-nav" {...rest}>
        <div className="section-divider mt-0"/>
        <h5>Account settings</h5>
        <ul>
            {ACCOUNT_TABS.filter(tab => !tab.hidden && !(editingOtherUser && tab.hiddenIfEditingOtherUser)).map(({tab, title}) =>
                <li key={tab}>
                    <ContentSidebarContext.Consumer>
                        {(context) =>
                            <StyledTabPicker id={title} tabIndex={0} checkboxTitle={title} checked={activeTab === tab}
                                onClick={() => { setActiveTab(tab); context?.close(); }} onKeyDown={ifKeyIsEnter(() => { setActiveTab(tab); context?.close(); })}
                            />
                        }
                    </ContentSidebarContext.Consumer>
                </li>
            )}
        </ul>
    </ContentSidebar>;
};
