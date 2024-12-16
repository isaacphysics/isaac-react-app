import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown, DropdownMenu, DropdownProps, DropdownToggle, Nav, NavLink } from "reactstrap";
import { Spacer } from "../../elements/Spacer";
import { MainSearchInput } from "../../elements/SearchInputs";
import classNames from "classnames";
import { HUMAN_STAGES, HUMAN_SUBJECTS, PHY_NAV_STAGES, PHY_NAV_SUBJECTS, isTeacherOrAbove } from "../../../services";
import { selectors, useAppSelector } from "../../../state";
import { LoginLogoutButton } from "./HeaderPhy";
import { useAssignmentsCount } from "../../navigation/NavigationBar";
import { Link } from "react-router-dom";

interface NavigationDropdownProps extends Omit<DropdownProps, "title"> {
    title: React.ReactNode;
    // if the above is not a string, the dropdown should have an aria label to describe it
    ariaTitle?: string;
}

const NavigationDropdown = (props: NavigationDropdownProps) => {
    const { className, title, ariaTitle, children, ...rest } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const timerId = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerId.current) {
            window.clearTimeout(timerId.current);
        }
    };

    // TODO: two dropdowns can be toggled simultaneously using keyboard focus and hover. disable hover if focus is active elsewhere

    const toggle = useCallback((e?: any) => {
        setIsOpen(o => !o);
        setIsFocused(false);
        if (e && e.type === "click") {
            if (isHovered) {
                setIsOpen(true);
            }
        }
        if (e && e.type === "touchstart") {
            setIsOpen(true);
        }

    }, [isHovered]);

    useEffect(() => {
        if (isHovered) {
            if (isOpen) {
                setIsFocused(true);
            } else {
                // start a 250ms timer to show the dropdown
                timerId.current = window.setTimeout(toggle, 250);
            }
        } else {
            clearTimer();

            if (isOpen && !isFocused) {
                toggle();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHovered]);

    return <Dropdown {...rest} nav inNavbar className={classNames(className, { "active": isOpen })} isOpen={isOpen} onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)} onMouseDown={() => setIsHovered(false)} toggle={toggle} title={""} aria-label={ariaTitle ?? title?.valueOf() as string}
        // the regular title prop is for a hover tooltip, which we don't want. not defining makes it use the nearest span instead...
    >

        <DropdownToggle nav className="p-2 pb-4" tabIndex={isOpen ? -1 : 0}>
            {title}
        </DropdownToggle>
        <DropdownMenu onMouseDown={(e) => e.stopPropagation()} onMouseUp={() => toggle()}>
            {/* don't fire the onMouseDown event in the parent Dropdown (needed for mobile press check) if we click on the body (i.e. a link). */}
            {children}
        </DropdownMenu>
    </Dropdown>;
};

interface NavigationSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
}

const NavigationSection = (props: NavigationSectionProps) => {
    const { children, className, ...rest } = props;

    {/* a little annoying, but the bottom padding must be moved to the links as we need the dropdown not to disappear when hovering the space between it and the button */ }
    return <div {...rest} className={classNames("d-flex flex-column p-3 pb-0 explore-group", className)}>
        {props.title ? <span className="px-2">{props.title}</span> : <Spacer />}
        <ul className="d-flex p-0 gap-2">
            {children}
        </ul>
    </div>;
};

interface NavigationItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
}

const NavigationItem = (props: NavigationItemProps) => {
    const { children, href, ...rest } = props;
    return <NavLink {...rest} to={href} tag={Link} tabIndex={0} role="menuitem" className="d-flex align-items-center px-4 py-2">
        {children}
    </NavLink>;
};

export const NavigationMenuPhy = () => {
    const user = useAppSelector(selectors.user.orNull);
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();

    return <Nav tag="nav" className="d-flex align-items-end" id="content-nav">
        <NavigationSection>
            <NavigationDropdown ariaTitle={`My Isaac (${assignmentsCount + quizzesCount} tasks to do)`} title={<div className="d-flex align-items-center">
                <i className="icon icon-my-isaac icon-color-brand me-2"/>
                My Isaac
                <span className="badge bg-primary rounded-5 ms-2 h-max-content">{assignmentsCount + quizzesCount}</span>
            </div>} id="my-isaac-dropdown">
                {user?.loggedIn
                    ? <div>
                        <div className="d-flex">
                            <div>
                                {isTeacherOrAbove(user) && <h5>{"STUDENT"}</h5>}
                                <NavigationItem href="/my_gameboards">
                                    My question packs
                                </NavigationItem>
                                <NavigationItem href="/assignments">
                                    My assignments
                                    <span className="badge bg-primary rounded-5 ms-2">{assignmentsCount}</span>
                                </NavigationItem>
                                <NavigationItem href="/progress">
                                    My progress
                                </NavigationItem>
                                <NavigationItem href="/tests">
                                    My tests
                                    <span className="badge bg-primary rounded-5 ms-2">{quizzesCount}</span>
                                </NavigationItem>
                            </div>

                            <div className="dropdown-divider-y" />

                            {isTeacherOrAbove(user) && <div>
                                <h5>{"TEACHER"}</h5>
                                <NavigationItem href="/teacher_features">
                                    Teacher features
                                </NavigationItem>
                                <NavigationItem href="/groups">
                                    Manage groups
                                </NavigationItem>
                                <NavigationItem href="/set_assignments">
                                    Set assignments
                                </NavigationItem>
                                <NavigationItem href="/assignment_schedule">
                                    Assignment schedule
                                </NavigationItem>
                                <NavigationItem href="/assignment_progress">
                                    Assignment progress
                                </NavigationItem>
                                <NavigationItem href="/set_tests">
                                    Set / manage tests
                                </NavigationItem>
                            </div>}
                        </div>

                        <div className="dropdown-divider" />
                        <NavigationItem href="/account">
                            My account
                        </NavigationItem>
                        <NavigationItem href="/logout">
                            Log out
                        </NavigationItem>
                    </div>
                    : <li className="px-4">
                        <span>You&apos;re not currently logged in. Log in or sign up for free below!</span>
                        <br/>
                        <LoginLogoutButton className="my-2"/>
                    </li>
                }
            </NavigationDropdown>
        </NavigationSection>
        <NavigationSection title="Explore by learning stage" className="border-start">
            {Object.entries(PHY_NAV_STAGES).map(([stage, subjects], i) => {
                const humanStage = HUMAN_STAGES[stage];
                return <NavigationDropdown key={i} title={humanStage}>
                    {subjects.map((subject, j) => {
                        const humanSubject = HUMAN_SUBJECTS[subject.valueOf()];
                        return <NavigationItem key={j} href={`/${subject}/${stage}`} data-bs-theme={subject}>
                            <i className="icon icon-hexagon me-1" />
                            <span>{humanStage} {humanSubject}</span>
                        </NavigationItem>;
                    })}
                </NavigationDropdown>;
            })}
        </NavigationSection>
        <NavigationSection title="Explore by subject" className="border-start">
            {Object.entries(PHY_NAV_SUBJECTS).map(([subject, stages], i) => {
                const humanSubject = HUMAN_SUBJECTS[subject];
                return <NavigationDropdown key={i} title={humanSubject} data-bs-theme={subject}>
                    {stages.map((stage, j) => {
                        const humanStage = HUMAN_STAGES[stage.valueOf()];
                        return <NavigationItem key={j} href={`/${subject}/${stage}`}>
                            <i className="icon icon-hexagon me-1" />
                            <span>{humanStage} {humanSubject}</span>
                        </NavigationItem>;
                    })}
                </NavigationDropdown>;
            })}
        </NavigationSection>
        <Spacer />
        <div className="header-search align-self-center d-print-none">
            <MainSearchInput inline />
        </div>
    </Nav>;
};
