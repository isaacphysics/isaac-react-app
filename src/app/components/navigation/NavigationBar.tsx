import React, {HTMLProps, useState} from "react";
import {Link} from "react-router-dom";
import {selectors, useAppSelector, useGetMyAssignmentsQuery, useGetQuizAssignmentsAssignedToMeQuery} from "../../state";
import {
    Badge,
    Dropdown,
    DropdownItem,
    DropdownItemProps,
    DropdownMenu,
    DropdownToggle,
    NavLink,
} from "reactstrap";
import {
    filterAssignmentsByStatus,
    isAda,
    isFound,
    isTeacherPending,
    isOverdue,
    isPhy,
    partitionCompleteAndIncompleteQuizzes,
    siteSpecific,
    useNavbarExpanded
} from "../../services";
import {RenderNothing} from "../elements/RenderNothing";
import classNames from "classnames";
import {skipToken} from "@reduxjs/toolkit/query";
import { AssignmentDTO, QuizAssignmentDTO } from "../../../IsaacApiTypes";

export const MenuOpenContext = React.createContext<{menuOpen: boolean; setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>}>({
    menuOpen: false, setMenuOpen: () => {}
});

export const LinkItem = ({children, muted, badgeTitle, ...props}: React.PropsWithChildren<DropdownItemProps & {muted?: boolean, badgeTitle?: string}>) => {
    const className = classNames(siteSpecific("px-6 px-lg-5 py-3", "ps-2 py-2 p-nav-3 font-h4 link-light"), {"text-muted": muted});
    return <li>
        <DropdownItem tag={Link} className={className} {...props}>
            {children}
            {badgeTitle && <Badge color="light" className="border-theme border bg-white ms-2 me-1">{badgeTitle}</Badge>}
        </DropdownItem>
    </li>;
};

export const LinkItemComingSoon = ({children}: {children: React.ReactNode}) => (
    <LinkItem to="/coming_soon" aria-disabled="true">
        <span className="me-2 text-muted">{children}</span>
        <Badge  color="light" className="border-theme border bg-white ms-auto me-1">Coming soon</Badge>
    </LinkItem>
);

interface NavigationSectionProps {className?: string; children?: React.ReactNode; title: React.ReactNode; topLevelLink?: boolean; to?: string}
export const NavigationSection = ({className, children, title, topLevelLink, to}: NavigationSectionProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {
        setIsOpen(!isOpen);
    };
    const linkClasses = siteSpecific("p-3 mx-3 mx-md-0", classNames("mx-0 mx-nav-1 p-3 font-h4 link-light", {"open": isOpen}));
    const dropdownClasses = siteSpecific("ps-2 ps-md-0 nav-section", "p-3 m-0 nav-section");
    const isNavExpanded = useNavbarExpanded();
    return <MenuOpenContext.Consumer>
        {({setMenuOpen}) => {
            return topLevelLink 
                ? <li className={className}>
                    <NavLink className={linkClasses} tag={Link} to={to} onClick={() => setMenuOpen(false)}>{title}</NavLink> 
                </li>
                : <Dropdown className={className} nav inNavbar={!isNavExpanded} isOpen={isOpen} toggle={isNavExpanded ? toggle : () => {}}>
                    <DropdownToggle nav tag={isPhy && !isNavExpanded ? "button" : undefined} caret={isPhy} onClick={!isNavExpanded ? toggle : () => {}} className={classNames(linkClasses, "d-flex w-100 text-start invert-underline align-items-center")}>
                        {title}
                        {isAda && <i className={classNames("icon icon-chevron-down icon-dropdown-180 icon-color-white float-end d-nav-none d-inline-block ms-auto", {"active": isOpen})}/>}
                    </DropdownToggle>
                    <DropdownMenu className={dropdownClasses} onClick={() => setMenuOpen(false)}>
                        <ul className="plain-list ps-0">{children}</ul>
                    </DropdownMenu>
                </Dropdown>;
        }}
    </MenuOpenContext.Consumer>;
};

export function MenuBadge({count, message, ...rest}: {count: number, message: string} & HTMLProps<HTMLDivElement>) {
    if (count == 0) {
        return RenderNothing;
    }
    return <div className={"d-inline"} {...rest}>
        <span className={classNames("badge rounded-pill ms-2", {"bg-grey text-body": isPhy, "bg-turquoise-blue text-dark": isAda})}>{count}</span>
        <span className="visually-hidden"> {message}</span>
    </div>;
}

export function getActiveWorkCount(assignments?: AssignmentDTO[], quizAssignments?: QuizAssignmentDTO[]) {
    const assignmentsCount = assignments
        ? filterAssignmentsByStatus(assignments).inProgress.length
        : 0;
    const quizzesCount = quizAssignments && isFound(quizAssignments)
        ? partitionCompleteAndIncompleteQuizzes(quizAssignments)[1].filter(q => !isOverdue(q)).length
        : 0;
    return {assignmentsCount, quizzesCount};
}

export function useAssignmentsCount() {
    const user = useAppSelector(selectors.user.orNull);

    // Only fetches assignments if the user is logged in (not including Ada partial logins), and refetch on login/logout, reconnect.
    const queryArg = user?.loggedIn && !isTeacherPending(user) ? undefined : skipToken;
    // We should add refetchOnFocus: true if we want to refetch on browser focus - hard to say if this is a good idea or not.
    const queryOptions = {refetchOnMountOrArgChange: true, refetchOnReconnect: true};

    const {data: assignments} = useGetMyAssignmentsQuery(queryArg, queryOptions);
    const {data: quizAssignments} = useGetQuizAssignmentsAssignedToMeQuery(queryArg, queryOptions);

    return getActiveWorkCount(assignments, quizAssignments);
}
