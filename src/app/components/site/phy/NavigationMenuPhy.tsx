import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Dropdown, DropdownMenu, DropdownProps, DropdownToggle, NavLink } from "reactstrap";
import { Spacer } from "../../elements/Spacer";
import { MainSearchInput } from "../../elements/SearchInputs";
import classNames from "classnames";
import { HUMAN_STAGES, HUMAN_SUBJECTS, LearningStage, PATHS, PHY_NAV_STAGES, PHY_NAV_SUBJECTS, Subject, above, below, ifKeyIsEnter, isFullyDefinedContext, isSingleStageContext, isStudent, isTutor, isTutorOrAbove, isValidStageSubjectPair, useDeviceSize } from "../../../services";
import { selectors, useAppSelector } from "../../../state";
import { LoginLogoutButton } from "./HeaderPhy";
import { useAssignmentsCount } from "../../navigation/NavigationBar";
import { Link, useNavigate } from "react-router-dom";
import { HoverableNavigationContext, PageContextState } from "../../../../IsaacAppTypes";
import max from "lodash/max";

interface NavigationDropdownProps extends Omit<DropdownProps, "title"> {
    title: React.ReactNode;
    // if the above is not a string, the dropdown should have an aria label to describe it
    ariaTitle?: string;
    toggleClassName?: string;
    ikey: number;
    isActiveUnderContext?: (context: PageContextState) => boolean;
}

const HoverableNavigationDropdown = (props: NavigationDropdownProps) => {
    const { className, title, ariaTitle, children, toggleClassName, ikey, isActiveUnderContext, ...rest } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const pageContext = useAppSelector(selectors.pageContext.context);
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

    return <Dropdown {...rest} nav inNavbar className={classNames(className, "hoverable", { "active": isOpen || isActiveUnderContext?.(pageContext)})} isOpen={isOpen}
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
        <DropdownMenu onMouseDown={(e) => e.stopPropagation()} onMouseUp={() => toggle()} onKeyDown={ifKeyIsEnter(() => toggle())}>
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
        <DropdownMenu onClick={() => toggle()}>
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
    subject: string;
    stage: string;
}

interface NavigationCategory {
    title: string;
    type: string;
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
    const pageContext = useAppSelector(selectors.pageContext.context);

    return above["xl"](deviceSize)
        // full-width, hoverable dropdowns
        ? <ContentNavHoverableWrapper title={title} {...rest}>
            {categories?.map((category, i, catsArr) => {
                const keyBase = max(catsArr.map(c => c.subcategories.length)) ?? 0;
                let sharedTheme = undefined;
                let quickSwitcher: {subject: Subject, stage: LearningStage} | undefined = undefined;

                if (category.subcategories.every((sub, _j, arr) => sub.subject === arr[0].subject) && category.subcategories.length > 1) {
                    sharedTheme = category.subcategories[0].subject;
                }

                if (category.type === "stage") {
                    if (isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext) && category.subcategories[0].stage !== pageContext.stage[0]) {
                        quickSwitcher = {
                            subject: pageContext.subject,
                            stage: category.subcategories[0].stage as LearningStage
                        };
                    }
                } else if (category.type === "subject") {
                    if (isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext) && category.subcategories[0].subject !== pageContext.subject) {
                        quickSwitcher = {
                            subject: category.subcategories[0].subject as Subject,
                            stage: pageContext.stage[0]
                        };
                    }
                }

                return <HoverableNavigationDropdown
                    key={i} ikey={props.ikey * keyBase + i} title={category.title} { ...(sharedTheme && { "data-bs-theme" : sharedTheme })}
                    isActiveUnderContext={(context) => {
                        if (!isFullyDefinedContext(context) || !isSingleStageContext(context)) return false;
                        if (category.type === "stage") {
                            return context.stage[0] === category.subcategories[0].stage;
                        }
                        if (category.type === "subject") {
                            return context.subject === category.subcategories[0].subject;
                        }
                        return false;
                    }}
                >
                    {quickSwitcher && isValidStageSubjectPair(quickSwitcher.subject, quickSwitcher.stage) && <NavigationItem
                        className="quick-switch flex-column"
                        data-bs-theme={quickSwitcher.subject}
                        href={`/${quickSwitcher.subject}/${quickSwitcher.stage}`}
                    >
                        <span className="mb-1">Quick switch to</span>
                        <span className="d-flex align-items-center">
                            <i className="icon icon-hexagon-bullet me-1" />
                            {`${HUMAN_STAGES[quickSwitcher.stage]} ${HUMAN_SUBJECTS[quickSwitcher.subject]}`}
                        </span>
                    </NavigationItem>

                    }
                    {category.subcategories.map((subcategory, j) => {
                        return <NavigationItem key={i * keyBase + j} className="align-items-center" href={subcategory.href} { ...(!sharedTheme && { "data-bs-theme" : subcategory.subject })}>
                            <i className="icon icon-hexagon-bullet me-1" />
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
                            return <div key={i}>
                                <h5 className="px-4 m-0 py-2">{category.title}</h5>
                                <ul className="plain-list">
                                    {category.subcategories.map((subcategory, j) => {
                                        return <NavigationItem key={j} className="align-items-center" href={subcategory.href} data-bs-theme={subcategory.subject}>
                                            <i className="icon icon-hexagon-bullet me-1" />
                                            <span>{subcategory.fullTitle}</span>
                                        </NavigationItem>;
                                    })}
                                </ul>
                                {i < categories.length - 1 && <div className="section-divider"/>}
                            </div>;
                        })}
                    </StaticNavigationDropdown>
                </ul>
            </div>
            // full width, accordion-style dropdowns -- only in the offcanvas
            : <ContentNavAccordionWrapper title={title}>
                {categories?.map((category, i) => {
                    return <div key={i}>
                        <h5 className="px-4 m-0 py-2">{category.title}</h5>
                        <ul className="plain-list">
                            {category.subcategories.map((subcategory, j) => {
                                return <NavigationItem key={j} className="align-items-center" href={subcategory.href} data-bs-theme={subcategory.subject} onClick={toggleMenu}>
                                    <i className="icon icon-hexagon-bullet me-1"/>
                                    <span>{subcategory.fullTitle}</span>
                                </NavigationItem>;
                            })}
                        </ul>
                        {i < categories.length - 1 && <div className="section-divider"/>}
                    </div>;
                })}
            </ContentNavAccordionWrapper>;
};

const ContentNavProfile = ({toggleMenu}: {toggleMenu: () => void}) => {
    const user = useAppSelector(selectors.user.orNull);
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();
    const deviceSize = useDeviceSize();

    const NavigationItemClose = (props: NavigationItemProps) => {
        return <NavigationItem {...props} onClick={() => below['sm'](deviceSize) && toggleMenu()} />;
    };

    const profileTabContents = <>
        {user?.loggedIn
            ? <div>
                <div className="d-flex flex-column flex-sm-row">
                    <div className="d-flex flex-column flex-grow-1">

                        {deviceSize === "xs" && isTutorOrAbove(user) && <>
                            <h5 className="mt-2">ACCOUNT</h5>
                            <ul className="plain-list">
                                <NavigationItemClose href="/account">
                                    My account
                                </NavigationItemClose>
                            </ul>
                            <div className="section-divider" />
                        </>}

                        {isTutorOrAbove(user) && <h5 className="pt-2 pt-sm-0">STUDENT</h5>}
                        <ul className="plain-list flex-grow-1">
                            <NavigationItemClose href={PATHS.MY_GAMEBOARDS}>
                                My question decks
                            </NavigationItemClose>
                            <NavigationItemClose href="/assignments" className="d-flex align-items-center">
                                My assignments
                                {assignmentsCount > 0 && <span className="badge bg-primary rounded-5 ms-2 h-max-content">{assignmentsCount > 99 ? "99+" : assignmentsCount}</span>}
                            </NavigationItemClose>
                            <NavigationItemClose href="/tests" className="d-flex align-items-center">
                                My tests
                                {quizzesCount > 0 && <span className="badge bg-primary rounded-5 ms-2 h-max-content">{quizzesCount > 99 ? "99+" : quizzesCount}</span>}
                            </NavigationItemClose>
                            <NavigationItemClose href="/progress">
                                My progress
                            </NavigationItemClose>
                        </ul>

                        {(above['sm'](deviceSize) || isStudent(user)) && <>
                            {isTutorOrAbove(user) 
                                ? <>
                                    <div className="section-divider me-n2" />
                                    <Spacer />
                                    <h5 className="mt-2">ACCOUNT</h5>
                                </>
                                : <div className="section-divider" />
                            }
                            <ul className="plain-list">
                                <NavigationItemClose href="/account">
                                    My account
                                </NavigationItemClose>
                            </ul>
                        </>}
                    </div>

                    {isTutorOrAbove(user) && <>
                        <div className={above["sm"](deviceSize) ? "section-divider-y" : "section-divider"}/>
                        <div className="flex-grow-1">
                            <h5 className="pt-2 pt-sm-0">{isTutor(user) ? "TUTOR" : "TEACHER"}</h5>
                            <ul className="plain-list">
                                {isTutor(user)
                                    ? <NavigationItemClose href="/tutor_features">
                                        Tutor features
                                    </NavigationItemClose>
                                    : <NavigationItemClose href="/teacher_features">
                                        Teacher features
                                    </NavigationItemClose>}
                                <NavigationItemClose href="/groups">
                                    Manage groups
                                </NavigationItemClose>
                                <NavigationItemClose href="/question_deck_builder">
                                    Create a question deck
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
                                {!isTutor(user) &&
                                    <NavigationItemClose href="/set_tests">
                                        Set / manage tests
                                    </NavigationItemClose>}
                            </ul>
                        </div>
                    </>}
                </div>
            </div>
            : <div className="px-4">
                <span>You&apos;re not currently logged in. Log in or sign up for free below!</span>
                <br/>
                <LoginLogoutButton className="my-2 w-max-content" onClick={toggleMenu}/>
            </div>
        }
    </>;

    const taskCount = assignmentsCount + quizzesCount;

    // Get first char of first & last names. If either is not a letter, don't display it.
    const userInitials = user?.loggedIn && user?.givenName && user?.familyName ?
        [...`${user.givenName[0]}${user.familyName[0]}`.toUpperCase()].filter(c => c.match(/[\p{L}]/u)) : undefined;

    const title = <div className="d-flex align-items-center">
        <div className="d-flex flex-column justify-content-center align-items-center me-2" aria-hidden="true">
            {userInitials?.length
                ? <>
                    <i className="icon-initials"/>
                    <span>{userInitials}</span>
                </>
                : <i className="icon icon-my-isaac"/>}
        </div>
        My Isaac
        {taskCount > 0 && <span className="badge bg-primary rounded-5 ms-2 h-max-content" data-testid={"my-assignments-badge"}>
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
    return <li>
        <NavLink {...rest} to={href} tag={Link} tabIndex={0} role="menuitem" className={classNames("d-flex px-4 py-2", rest.className)}>
            {children}
        </NavLink>
    </li>;
};

export const NavigationMenuPhy = ({toggleMenu}: {toggleMenu: () => void}) => {
    const openHoverable = useRef<number | undefined>(undefined);
    // we use a ref over useState for tracking which hoverable is open as the delay from using setState can lead to this not being reset to undefined
    // while moving the mouse between two hoverables, preventing the second dropdown from opening.

    const deviceSize = useDeviceSize();
    const navigate = useNavigate();

    const stageCategories : NavigationCategory[] = Object.entries(PHY_NAV_STAGES).map(([stage, subjects]) => {
        const humanStage = HUMAN_STAGES[stage];
        return {
            title: humanStage,
            type: "stage",
            subcategories: subjects.map((subject) => {
                const humanSubject = HUMAN_SUBJECTS[subject.valueOf()];
                return {
                    fullTitle: `${humanStage} ${humanSubject}`,
                    href: `/${subject}/${stage}`,
                    subject,
                    stage,
                };
            })
        };
    });

    const subjectCategories : NavigationCategory[] = Object.entries(PHY_NAV_SUBJECTS).map(([subject, stages]) => {
        const humanSubject = HUMAN_SUBJECTS[subject];
        return {
            title: humanSubject,
            type: "subject",
            subcategories: stages.map((stage) => {
                const humanStage = HUMAN_STAGES[stage.valueOf()];
                return {
                    fullTitle: `${humanStage} ${humanSubject}`,
                    href: `/${subject}/${stage}`,
                    subject,
                    stage,
                };
            })
        };
    });

    return <HoverableNavigationContext.Provider value={{openId: openHoverable}}>
        {below["sm"](deviceSize) && <div className="w-100 align-self-end d-print-none mb-3">
            <MainSearchInput onSearch={(s) => {
                void navigate(`/search?query=${encodeURIComponent(s)}`);
                toggleMenu();
            }}/>
        </div>}

        <ContentNavProfile toggleMenu={toggleMenu}/>
        <ContentNavSection title="Explore by learning stage" categories={stageCategories} className="border-start" ikey={0} toggleMenu={toggleMenu}/>
        <ContentNavSection title="Explore by subject" categories={subjectCategories} className="border-start" ikey={1} toggleMenu={toggleMenu}/>

        {above["md"](deviceSize) && <>
            <Spacer />
            <div className="header-search align-self-center d-print-none">
                <MainSearchInput inline onSearch={(s) => navigate(`/search?query=${encodeURIComponent(s)}`)} />
            </div>
        </>}
    </HoverableNavigationContext.Provider>;
};
