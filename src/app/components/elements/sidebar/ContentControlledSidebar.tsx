import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SidebarDTO, SidebarEntryDTO } from "../../../../IsaacApiTypes";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import classNames from "classnames";
import { calculateSidebarLink, isSidebarGroup, containsActiveTab } from "../../../services/sidebar";
import { CollapsibleList } from "../CollapsibleList";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { Markup } from "../markup";

const SidebarEntries = ({ entry }: { entry: SidebarEntryDTO }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = location.pathname === calculateSidebarLink(entry);
    const [isOpen, setIsOpen] = useState(isSidebarGroup(entry) && containsActiveTab(entry, location.pathname));
    return isSidebarGroup(entry)
        ? <CollapsibleList
            title={<div className="d-flex flex-column gap-2 chapter-title">
                <span className="text-theme">{entry.label}</span>
                <h6 className={classNames("m-0", {"text-theme fw-semibold": isActive})}><Markup encoding="latex">{entry.title}</Markup></h6>
            </div>}
            tag={"li"}
            className="ms-2"
            expanded={isOpen}
            toggle={() => setIsOpen(o => !o)}
        >
            <ul>
                {entry.sidebarEntries?.map((subEntry, subIndex) =>
                    <SidebarEntries key={subIndex} entry={subEntry} />
                )}
            </ul>
        </CollapsibleList>
        : <li className="ms-2">
            <StyledTabPicker
                checkboxTitle={<div className="d-flex">
                    {entry.label && <span className="text-theme me-2">{entry.label}</span>}
                    <span className="flex-grow-1"><Markup encoding="latex">{entry.title}</Markup></span>
                </div>}
                checked={isActive}
                onClick={(() => navigate(calculateSidebarLink(entry) ?? ""))}
            />
        </li>;
};

export const ContentControlledSidebar = ({sidebar, ...rest}: ContentSidebarProps & {sidebar?: SidebarDTO}) => {
    return <ContentSidebar buttonTitle={sidebar?.subtitle} {...rest}>
        <div className="section-divider"/>
        <ul>
            {sidebar?.sidebarEntries?.map((entry, index) => (
                <SidebarEntries key={index} entry={entry} />
            ))}
        </ul>
    </ContentSidebar>;
};
