import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown, DropdownMenu, DropdownProps, DropdownToggle, Nav, NavLink } from "reactstrap";
import { Spacer } from "../../elements/Spacer";
import { MainSearchInput } from "../../elements/SearchInputs";
import classNames from "classnames";
import { HUMAN_STAGES, HUMAN_SUBJECTS, PHY_NAV_STAGES, PHY_NAV_SUBJECTS, above, isTeacherOrAbove, useDeviceSize } from "../../../services";
import { selectors, useAppSelector } from "../../../state";
import { LoginLogoutButton } from "./HeaderPhy";
import { useAssignmentsCount } from "../../navigation/NavigationBar";
import { Link } from "react-router-dom";

interface NavigationDropdownProps extends Omit<DropdownProps, "title"> {
    title: React.ReactNode;
    // if the above is not a string, the dropdown should have an aria label to describe it
    ariaTitle?: string;
    toggleClassName?: string;
}

const HoverableNavigationDropdown = (props: NavigationDropdownProps) => {
    const { className, title, ariaTitle, children, toggleClassName, ...rest } = props;
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

    return <Dropdown {...rest} nav inNavbar className={classNames(className, "hoverable", { "active": isOpen })} isOpen={isOpen} onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)} onMouseDown={() => setIsHovered(false)} toggle={toggle} title={""} aria-label={ariaTitle ?? title?.valueOf() as string}
        // the regular title prop is for a hover tooltip, which we don't want. not defining makes it use the nearest span instead...
    >

        <DropdownToggle nav className={classNames("p-2 pb-4", toggleClassName)} tabIndex={isOpen ? -1 : 0}>
            {title}
        </DropdownToggle>
        <DropdownMenu onMouseDown={(e) => e.stopPropagation()} onMouseUp={() => toggle()}>
            {/* don't fire the onMouseDown event in the parent Dropdown (needed for mobile press check) if we click on the body (i.e. a link). */}
            {children}
        </DropdownMenu>
    </Dropdown>;
};

const StaticNavigationDropdown = (props: NavigationDropdownProps) => {
    const { className, title, ariaTitle, children, ...rest } = props;
    const [isOpen, setIsOpen] = useState(false);

    const toggle = useCallback(() => {
        setIsOpen(o => !o);
    }, []);

    return <Dropdown {...rest} nav inNavbar className={classNames(className, { "active": isOpen })} isOpen={isOpen} toggle={toggle} 
        title={""} aria-label={ariaTitle ?? title?.valueOf() as string}
    >
        <DropdownToggle nav className="py-4 px-3 px-lg-4" tabIndex={0}>
            {title}
        </DropdownToggle>
        <DropdownMenu>
            {children}
        </DropdownMenu>
    </Dropdown>;
};

interface NavigationSubcategory {
    fullTitle: string;
    href: string;
    theme: string;
}

interface NavigationCategory {
    title: string;
    subcategories: NavigationSubcategory[];
}

interface NavigationSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    categories?: NavigationCategory[];
}

const NavigationSection = (props: NavigationSectionProps) => {
    const { title, categories, className, ...rest } = props;
    const deviceSize = useDeviceSize();

    return above["xl"](deviceSize) 
        ? <div {...rest} className={classNames("d-flex flex-column p-3 pb-0 explore-group", className)}>
            {/* a little annoying, but the bottom padding (^) must be moved to the links as we need the dropdown not to disappear when hovering the space between it and the button */ }
            {title ? <span className="px-2">{title}</span> : <Spacer />}
            <ul className="d-flex p-0 gap-2 m-0">
                {categories?.map((category, i) => <HoverableNavigationDropdown key={i} title={category.title}>
                    {category.subcategories.map((subcategory, j) => {
                        return <NavigationItem key={j} href={subcategory.href} data-bs-theme={subcategory.theme}>
                            <i className="icon icon-hexagon me-1" />
                            <span>{subcategory.fullTitle}</span>
                        </NavigationItem>;
                    })}
                </HoverableNavigationDropdown>)}
            </ul>
        </div> 
        : <div className="explore-group">
            <ul className="d-flex p-0 gap-2 m-0">
                <StaticNavigationDropdown title={title} className={className}>
                    {categories?.map((category, i) => {
                        return <>
                            <h5 className="px-4 m-0 py-2">{category.title}</h5>
                            {category.subcategories.map((subcategory, j) => {
                                return <NavigationItem key={j} href={subcategory.href} data-bs-theme={subcategory.theme}>
                                    <i className="icon icon-hexagon me-1" />
                                    <span>{subcategory.fullTitle}</span>
                                </NavigationItem>;
                            })}
                            {i < categories.length - 1 && <div className="dropdown-divider"/>}
                        </>;
                    })}
                </StaticNavigationDropdown>
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

    const stageCategories = Object.entries(PHY_NAV_STAGES).map(([stage, subjects]) => {
        const humanStage = HUMAN_STAGES[stage];
        return {
            title: humanStage,
            subcategories: subjects.map((subject) => {
                const humanSubject = HUMAN_SUBJECTS[subject.valueOf()];
                return {
                    fullTitle: `${humanStage} ${humanSubject}`,
                    href: `/${subject}/${stage}`,
                    theme: subject,
                };
            })
        };
    });

    const subjectCategories = Object.entries(PHY_NAV_SUBJECTS).map(([subject, stages]) => {
        const humanSubject = HUMAN_SUBJECTS[subject];
        return {
            title: humanSubject,
            subcategories: stages.map((stage) => {
                const humanStage = HUMAN_STAGES[stage.valueOf()];
                return {
                    fullTitle: `${humanStage} ${humanSubject}`,
                    href: `/${subject}/${stage}`,
                    theme: subject,
                };
            })
        };
    });

    return <Nav tag="nav" className="d-flex align-items-end" id="content-nav">
        <div className={"d-flex flex-column p-0 pt-3 pe-3 explore-group"}>
            <ul className="d-flex p-0 gap-2 m-0">
                <HoverableNavigationDropdown 
                    ariaTitle={`My Isaac (${assignmentsCount + quizzesCount} tasks to do)`} 
                    title={<div className="d-flex align-items-center">
                        <i className="icon icon-my-isaac icon-color-brand me-2"/>
                        My Isaac
                        <span className="badge bg-primary rounded-5 ms-2 h-max-content">{assignmentsCount + quizzesCount > 99 ? "99+" : assignmentsCount + quizzesCount}</span>
                    </div>} 
                    id="my-isaac-dropdown"
                    toggleClassName="ps-0"
                >
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
                </HoverableNavigationDropdown>
            </ul>
        </div>
        <NavigationSection title="Explore by learning stage" categories={stageCategories} className="border-start"/>
        <NavigationSection title="Explore by subject" categories={subjectCategories} className="border-start">
        </NavigationSection>
        <Spacer />
        <div className="header-search align-self-center d-print-none">
            <MainSearchInput inline />
        </div>
    </Nav>;
};
