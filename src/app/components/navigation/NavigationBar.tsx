import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
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
    UncontrolledDropdown
} from "reactstrap";
import {loadMyAssignments} from "../../state/actions";
import {filterAssignmentsByStatus} from "../../services/assignments";


const MenuOpenContext = React.createContext<{menuOpen: boolean; setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>}>({
    menuOpen: false, setMenuOpen: () => {}
});

export const LinkItem = ({children, muted, ...props}: React.PropsWithChildren<DropdownItemProps & {muted?: boolean}>) => (
    <DropdownItem tag={Link} className={`pl-4 py-3 p-md-3 ${muted ? "text-muted" : ""}`} {...props}>
        {children}
    </DropdownItem>
);

export const LinkItemComingSoon = ({children}: {children: React.ReactNode}) => (
    <LinkItem to="/coming_soon" aria-disabled="true">
        <span className="mr-2 text-muted">{children}</span>
        <Badge  color="light" className="border-secondary border bg-white ml-auto mr-1">Coming soon</Badge>
    </LinkItem>
);

interface NavigationSectionProps {children: React.ReactNode; title: React.ReactNode; topLevelLink?: boolean; to?: string}
export const NavigationSection = ({children, title, topLevelLink, to}: NavigationSectionProps) => (
    <MenuOpenContext.Consumer>
        {({setMenuOpen}) => <UncontrolledDropdown nav inNavbar>
            {topLevelLink ?
                <NavLink className="p-3 ml-3 mr-3" tag={Link} to={to} onClick={() => setMenuOpen(false)}>{title}</NavLink> :
                <DropdownToggle nav caret className="p-3 ml-3 mr-3">{title}</DropdownToggle>}
            <DropdownMenu className="p-3 pt-0 m-0 mx-lg-4" onClick={() => setMenuOpen(false)}>
                {children}
            </DropdownMenu>
        </UncontrolledDropdown>}
    </MenuOpenContext.Consumer>
);

export const useAssignmentBadge = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => (state && state.user) || null);

    useEffect(() => {
        if (user?.loggedIn) {
            dispatch(loadMyAssignments());
        }
    }, [user]);

    const assignmentBadge = useSelector((state: AppState) => {
        if (state?.assignments) {
            const {inProgressRecent} = filterAssignmentsByStatus(state.assignments);
            const assignmentCount = inProgressRecent.length;
            if (assignmentCount > 0) {
                return <React.Fragment>
                    <span className="badge badge-pill bg-grey ml-2">{assignmentCount}</span>
                    <span className="sr-only">Incomplete assignments</span>
                </React.Fragment>
            }
        }
    });
    return assignmentBadge;
};

export const NavigationBar = ({children}: {children: React.ReactNode}) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return <MenuOpenContext.Provider value={{menuOpen, setMenuOpen}}>
        <Navbar className="main-nav p-0" color="light" light expand="md">
            <NavbarToggler onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
                Menu
            </NavbarToggler>

            <Collapse isOpen={menuOpen} navbar className="px-0 mx-0 px-xl-5 mx-xl-5">
                <Nav navbar className="justify-content-between" id="main-menu">
                    {children}
                </Nav>
            </Collapse>
        </Navbar>
    </MenuOpenContext.Provider>
};
