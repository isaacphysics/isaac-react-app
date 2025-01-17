import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Dropdown, DropdownMenu, DropdownProps, DropdownToggle, NavLink } from "reactstrap";
import { Spacer } from "../../elements/Spacer";
import { MainSearchInput } from "../../elements/SearchInputs";
import classNames from "classnames";
import { HUMAN_STAGES, HUMAN_SUBJECTS, PHY_NAV_STAGES, PHY_NAV_SUBJECTS, above, isTeacherOrAbove, useDeviceSize } from "../../../services";
import { selectors, useAppSelector } from "../../../state";
import { LoginLogoutButton } from "./HeaderPhy";
import { useAssignmentsCount } from "../../navigation/NavigationBar";
import { Link } from "react-router-dom";
import { HoverableNavigationContext } from "../../../../IsaacAppTypes";

interface NavigationDropdownProps extends Omit<DropdownProps, "title"> {
    title: React.ReactNode;
    // if the above is not a string, the dropdown should have an aria label to describe it
    ariaTitle?: string;
    toggleClassName?: string;
    ikey: number;
}

const HoverableNavigationDropdown = (props: NavigationDropdownProps) => {
    const { className, title, ariaTitle, children, toggleClassName, ikey, ...rest } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const hoverContext = useContext(HoverableNavigationContext);
    const timerId = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerId.current) {
            window.clearTimeout(timerId.current);
        }
    };

    const toggle = useCallback((e?: any) => {
        if (e && e.type === "click") {
            setIsOpen(isHovered);
            setIsFocused(isHovered);
            clearTimer();
        } else if (e && e.type === "touchstart") {
            // touchstart is called *alongside* click, as two different events!
            setIsHovered(false);
        } else if (e && e.type === "keydown") {
            setIsOpen(o => !o);
            setIsFocused(f => !f);
        } else { // hover
            setIsOpen(o => !o && hoverContext?.openId.current === undefined);
        }
    }, [hoverContext?.openId, isHovered]);

    useEffect(() => {
        if (!hoverContext) return;
        hoverContext.openId.current = isOpen ? ikey : (hoverContext?.openId.current === ikey ? undefined : hoverContext?.openId.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, ikey]);

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

    return <Dropdown {...rest} nav inNavbar className={classNames(className, "hoverable", { "active": isOpen })} isOpen={isOpen} 
        onMouseEnter={() => setIsHovered(true)}
        onPointerDown={(e) => {if (e.pointerType === "touch") {
            setIsHovered(true);
        }}}
        onMouseLeave={() => setIsHovered(false)} toggle={toggle} title={""} aria-label={ariaTitle ?? title?.valueOf() as string}
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
    const { className, title, ariaTitle, children, ikey, ...rest } = props;
    const [isOpen, setIsOpen] = useState(false);
    const hoverContext = useContext(HoverableNavigationContext);

    const toggle = useCallback(() => {
        setIsOpen(o => !o);
    }, []);

    useEffect(() => {
        if (!hoverContext) return;
        hoverContext.openId.current = isOpen ? ikey : (hoverContext.openId.current === ikey ? undefined : hoverContext.openId.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, ikey]);

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

interface ContentNavWrapperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title?: React.ReactNode;
}

const ContentNavHoverableWrapper = (props : ContentNavWrapperProps) => {
    const {title, className, children, ...rest} = props;
    return <div {...rest} className={classNames("d-flex flex-column p-3 pb-0 explore-group", className)}>
        {/* a little annoying, but the bottom padding (^) must be moved to the links as we need the dropdown not to disappear when hovering the space between it and the button */ }
        {title ? <span className="px-2">{title}</span> : <Spacer />}
        <ul className="d-flex p-0 gap-2 m-0">
            {children}
        </ul>
    </div>; 
};

const ContentNavAccordionWrapper = (props : ContentNavWrapperProps) => {
    const {title, children, ...rest} = props;
    const [open, setOpen] = useState<string>('');
    const toggle = (id : string) => setOpen(open === id ? '' : id);

    return <Accordion className="explore-group mb-3" open={open} toggle={toggle} tag={"li"}>
        <AccordionItem>
            <AccordionHeader targetId="1" tag={"h5"}>
                {title}
            </AccordionHeader>
            <AccordionBody accordionId="1" {...rest}>
                {children}
            </AccordionBody>
        </AccordionItem>
    </Accordion>;
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
    ikey: number;
    toggleMenu: () => void;
    categories?: NavigationCategory[];
}

const ContentNavSection = (props: NavigationSectionProps) => {
    const { title, categories, toggleMenu, ...rest } = props;
    const deviceSize = useDeviceSize();

    return above["xl"](deviceSize) 
        // full-width, hoverable dropdowns
        ? <ContentNavHoverableWrapper title={title} {...rest}>
            {categories?.map((category, i, catsArr) => {
                let sharedTheme = undefined;
                if (category.subcategories.every((sub, _j, arr) => sub.theme === arr[0].theme)) {
                    sharedTheme = category.subcategories[0].theme;
                }
                return <HoverableNavigationDropdown key={i} ikey={props.ikey * catsArr.length + i} title={category.title} { ...(sharedTheme && { "data-bs-theme" : sharedTheme })}>
                    {category.subcategories.map((subcategory, j) => {
                        return <NavigationItem key={j} href={subcategory.href} { ...(!sharedTheme && { "data-bs-theme" : subcategory.theme })}>
                            <i className="icon icon-hexagon me-1" />
                            <span>{subcategory.fullTitle}</span>
                        </NavigationItem>;
                    })}
                </HoverableNavigationDropdown>;
            })}
        </ContentNavHoverableWrapper> 
        // restricted width, static dropdowns
        : above["md"](deviceSize) 
            ? <div className="explore-group">
                <ul className="d-flex p-0 gap-2 m-0">
                    <StaticNavigationDropdown title={title} {...rest}>
                        {categories?.map((category, i) => {
                            return <>
                                <h5 className="px-4 m-0 py-2">{category.title}</h5>
                                {category.subcategories.map((subcategory, j) => {
                                    return <NavigationItem key={j} href={subcategory.href} data-bs-theme={subcategory.theme}>
                                        <i className="icon icon-hexagon me-1" />
                                        <span>{subcategory.fullTitle}</span>
                                    </NavigationItem>;
                                })}
                                {i < categories.length - 1 && <div className="section-divider"/>}
                            </>;
                        })}
                    </StaticNavigationDropdown>
                </ul>
            </div>
            // full width, accordion-style dropdowns -- only in the offcanvas
            : <ContentNavAccordionWrapper title={title}>
                {categories?.map((category, i) => {
                    return <>
                        <h5 className="px-4 m-0 py-2">{category.title}</h5>
                        {category.subcategories.map((subcategory, j) => {
                            return <NavigationItem key={j} href={subcategory.href} data-bs-theme={subcategory.theme} onClick={toggleMenu}>
                                <i className="icon icon-hexagon me-1"/>
                                <span>{subcategory.fullTitle}</span>
                            </NavigationItem>;
                        })}
                        {i < categories.length - 1 && <div className="section-divider"/>}
                    </>;
                })}
            </ContentNavAccordionWrapper>;
};

const ContentNavProfile = ({toggleMenu}: {toggleMenu: () => void}) => {
    const user = useAppSelector(selectors.user.orNull);
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();
    const deviceSize = useDeviceSize();

    const NavigationItemClose = (props: NavigationItemProps) => {
        return <NavigationItem {...props} onClick={toggleMenu} />;
    };

    const profileTabContents = <>
        {user?.loggedIn
            ? <div>
                <div className="d-flex flex-column flex-sm-row">
                    <div>
                        {isTeacherOrAbove(user) && <h5>STUDENT</h5>}
                        <NavigationItemClose href="/my_gameboards">
                            My question packs
                        </NavigationItemClose>
                        <NavigationItemClose href="/assignments">
                            My assignments
                            {assignmentsCount > 0 && <span className="badge bg-primary rounded-5 ms-2">{assignmentsCount > 99 ? "99+" : assignmentsCount}</span>}
                        </NavigationItemClose>
                        <NavigationItemClose href="/progress">
                            My progress
                        </NavigationItemClose>
                        <NavigationItemClose href="/tests">
                            My tests
                            {quizzesCount > 0 && <span className="badge bg-primary rounded-5 ms-2">{quizzesCount > 99 ? "99+" : quizzesCount}</span>}
                        </NavigationItemClose>
                    </div>

                    {isTeacherOrAbove(user) && <>                    
                        <div className={above["sm"](deviceSize) ? "section-divider-y" : "section-divider"}/>
                        <div>
                            <h5 className="pt-2 pt-sm-0">{"TEACHER"}</h5>
                            <NavigationItemClose href="/teacher_features">
                                Teacher features
                            </NavigationItemClose>
                            <NavigationItemClose href="/groups">
                                Manage groups
                            </NavigationItemClose>
                            <NavigationItemClose href="/set_assignments">
                                Set assignments
                            </NavigationItemClose>
                            <NavigationItemClose href="/assignment_schedule">
                                Assignment schedule
                            </NavigationItemClose>
                            <NavigationItemClose href="/assignment_progress">
                                Assignment progress
                            </NavigationItemClose>
                            <NavigationItemClose href="/set_tests">
                                Set / manage tests
                            </NavigationItemClose>
                        </div>
                    </>}
                </div>

                <div className="section-divider" />
                <NavigationItemClose href="/account">
                    My account
                </NavigationItemClose>
                <NavigationItemClose href="/logout">
                    Log out
                </NavigationItemClose>
            </div>
            : <div className="px-4">
                <span>You&apos;re not currently logged in. Log in or sign up for free below!</span>
                <br/>
                <LoginLogoutButton className="my-2"/>
            </div>
        }
    </>;

    const taskCount = assignmentsCount + quizzesCount;

    const title = <div className="d-flex align-items-center">
        <i className="icon icon-my-isaac me-2"/>
        My Isaac
        {taskCount > 0 && <span className="badge bg-primary rounded-5 ms-2 h-max-content">
            {taskCount > 99 ? "99+" : taskCount}
        </span>}
    </div>;

    return above["md"](deviceSize) 
        ? <ContentNavHoverableWrapper className="ps-0"> 
            <HoverableNavigationDropdown 
                ariaTitle={`My Isaac (${taskCount} tasks to do)`} 
                title={title} 
                id="my-isaac-dropdown"
                toggleClassName="ps-0"
                ikey={-1}
            >
                {profileTabContents}   
            </HoverableNavigationDropdown>
        </ContentNavHoverableWrapper>
        : <ContentNavAccordionWrapper title={title}>
            {profileTabContents}
        </ContentNavAccordionWrapper>;
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

export const NavigationMenuPhy = ({toggleMenu}: {toggleMenu: () => void}) => {
    const openHoverable = useRef<number | undefined>(undefined);
    // we use a ref over useState for tracking which hoverable is open as the delay from using setState can lead to this not being reset to undefined 
    // while moving the mouse between two hoverables, preventing the second dropdown from opening.
    
    const deviceSize = useDeviceSize();

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

    return <HoverableNavigationContext.Provider value={{openId: openHoverable}}>
        <ContentNavProfile toggleMenu={toggleMenu}/>
        <ContentNavSection title="Explore by learning stage" categories={stageCategories} className="border-start" ikey={0} toggleMenu={toggleMenu}/>
        <ContentNavSection title="Explore by subject" categories={subjectCategories} className="border-start" ikey={1} toggleMenu={toggleMenu}/>
        
        {above["md"](deviceSize) && <>
            <Spacer />
            <div className="header-search align-self-center d-print-none">
                <MainSearchInput inline />
            </div>
        </>}
    </HoverableNavigationContext.Provider>;
};
