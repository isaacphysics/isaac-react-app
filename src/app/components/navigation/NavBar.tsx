import React, { HTMLProps, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isaacApi, loadQuizAssignedToMe, selectors, useAppDispatch, useAppSelector } from "../../state";
import {
  Badge,
  Collapse,
  DropdownItem,
  DropdownItemProps,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarToggler,
  NavLink,
  UncontrolledDropdown,
} from "reactstrap";
import { filterAssignmentsByStatus, isFound, partitionCompleteAndIncompleteQuizzes, isLoggedIn } from "../../services";
import { RenderNothing } from "../elements/RenderNothing";
import classNames from "classnames";
import { skipToken } from "@reduxjs/toolkit/query";

const MenuOpenContext = React.createContext<{
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  menuOpen: false,
  setMenuOpen: () => {},
});

export const LinkItem = ({
  children,
  muted,
  badgeTitle,
  ...props
}: React.PropsWithChildren<DropdownItemProps & { muted?: boolean; badgeTitle?: string }>) => (
  <DropdownItem tag={Link} className={classNames("pl-4 py-3 p-md-3", { "text-muted": muted })} {...props}>
    {children}
    {badgeTitle && (
      <Badge color="light" className="border-secondary border bg-white ml-2 mr-1">
        {badgeTitle}
      </Badge>
    )}
  </DropdownItem>
);

export const LinkItemComingSoon = ({ children }: { children: React.ReactNode }) => (
  <LinkItem to="/coming_soon" aria-disabled="true">
    <span className="mr-2 text-muted">{children}</span>
    <Badge color="light" className="border-secondary border bg-white ml-auto mr-1">
      Coming soon
    </Badge>
  </LinkItem>
);

interface NavigationSectionProps {
  children: React.ReactNode;
  title: React.ReactNode;
  svgIcon?: React.ReactNode;
  topLevelLink?: boolean;
  to?: string;
}
export const NavigationSection = ({ children, svgIcon, title, topLevelLink, to }: NavigationSectionProps) => (
  <MenuOpenContext.Consumer>
    {({ setMenuOpen }) => (
      <UncontrolledDropdown nav inNavbar>
        {topLevelLink ? (
          <NavLink className="p-3 ml-3 mr-3" tag={Link} to={to} onClick={() => setMenuOpen(false)}>
            {svgIcon && <span className="mr-2">{svgIcon}</span>}
            {title}
          </NavLink>
        ) : (
          <DropdownToggle nav caret className="p-3 mr-3">
            {title}
            {svgIcon && <span className="mr-2">{svgIcon}</span>}
          </DropdownToggle>
        )}
        <DropdownMenu className="p-3 pt-0 m-0 mx-lg-4" onClick={() => setMenuOpen(false)}>
          {children}
        </DropdownMenu>
      </UncontrolledDropdown>
    )}
  </MenuOpenContext.Consumer>
);

export function MenuBadge({ count, message, ...rest }: { count: number; message: string } & HTMLProps<HTMLDivElement>) {
  if (count == 0) {
    return RenderNothing;
  }
  return (
    <div className={"d-inline"} {...rest}>
      <span className="badge badge-pill bg-grey ml-2">{count}</span>
      <span className="sr-only"> {message}</span>
    </div>
  );
}

export function useAssignmentsCount() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectors.user.orNull);
  const quizzes = useAppSelector((state) => state?.quizAssignedToMe);
  const { data: assignments } = isaacApi.endpoints.getMyAssignments.useQuery(user?.loggedIn ? undefined : skipToken, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });

  const loggedInUserId = isLoggedIn(user) ? user.id : undefined;
  useEffect(() => {
    if (user?.loggedIn) {
      dispatch(loadQuizAssignedToMe());
    }
  }, [dispatch, loggedInUserId]);

  const assignmentsCount = assignments ? filterAssignmentsByStatus(assignments).inProgressRecent.length : 0;
  const quizzesCount = quizzes && isFound(quizzes) ? partitionCompleteAndIncompleteQuizzes(quizzes)[1].length : 0;

  return { assignmentsCount, quizzesCount };
}

export const NavBar = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MenuOpenContext.Provider value={{ menuOpen, setMenuOpen }}>
      <Navbar className="main-nav p-0" color="light" light expand="md">
        <NavbarToggler onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
          <img src="/assets/hamburger-menu.svg" alt="Menu icon" className="menu-icon" />
        </NavbarToggler>
        <Collapse isOpen={menuOpen} navbar className="px-0 mx-0">
          <Nav navbar className="justify-content-between" id="main-menu">
            {children}
          </Nav>
        </Collapse>
      </Navbar>
    </MenuOpenContext.Provider>
  );
};
