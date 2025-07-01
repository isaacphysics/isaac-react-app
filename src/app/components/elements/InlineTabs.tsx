import classNames from "classnames";
import React from "react";

interface InlineTabsProps<T> extends React.HTMLProps<HTMLDivElement> {
    tabs: {
        label: string;
        value: T;
    }[];
    activeTab: T;
    setActiveTab: (newTab: T) => void;
    onTabChange?: (newTab: T) => void;
}

export const InlineTabs = <T extends string>({tabs, activeTab, setActiveTab, onTabChange, ...props}: InlineTabsProps<T>) => {
    return <div {...props} className={classNames("d-flex w-100 align-items-center inline-tabs", props.className)}>
        {tabs.map((tab, index) => <button
            key={index}
            onClick={() => {
                setActiveTab(tabs[index].value);
                if (onTabChange) onTabChange(tabs[index].value);
            }}
            className={classNames("fw-bold", {"active": tab.value === activeTab})}
        >
            {tab.label}
        </button>)}
    </div>;
};
