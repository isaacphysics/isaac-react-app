import React, {useState} from "react";
import {openActiveModal, selectors, useAppDispatch, useAppSelector, useGetSegueEnvironmentQuery} from "../../../state";
import {Collapse, Nav, Navbar, NavbarBrand, NavbarToggler} from "reactstrap";
import {
    isAdmin,
    isAdminOrEventManager,
    isEventLeader,
    isLoggedIn,
    isStaff,
    PATHS,
    useUserNotifications
} from "../../../services";
import {
    LinkItem,
    LinkItemButton,
    MenuBadge,
    MenuOpenContext,
    NavigationSection,
} from "../../navigation/NavigationBar";
import classNames from "classnames";
import {AdaHeaderSearch} from "../../elements/SearchInputs";
import { useNavigate } from "react-router";
import { FeatureFlagModal, hasActiveFeatureFlagOverrides } from "../../../services/featureFlag";
import { useTranslation } from 'react-i18next'

export const HeaderCS = () => {
    const { t } = useTranslation()
    const user = useAppSelector(selectors.user.orNull);
    const { notifications } = useUserNotifications();
    const dispatch = useAppDispatch();

    const { data: env } = useGetSegueEnvironmentQuery();
    const isNonProd = env === "DEV";

    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);

    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const navigate = useNavigate();

    const closeWholeNavbar = () => {
        setIsOpen(false);
        setIsSearchOpen(false);
    };

    return <header className="light" data-testid={"header"}>
        <Navbar expand="nav" className={"px-0 px-nav-3 pb-0 pb-nav-2"}>
            <NavbarBrand href="/" className="header-logo ms-3 mb-2 mb-nav-0 link-light">
                <img src="/assets/common/logos/ada_logo_3-stack_aqua_white_text.svg" alt={t('adaComputerScience', 'Ada Computer Science')} />
            </NavbarBrand>

            <a href={`#${mainContentId}`} className="skip-main position-absolute">{t('skipToMainContent', 'Skip to main content')}</a>

            <button aria-label={t('toggleSearchBar', 'Toggle search bar')} className={"ms-auto me-4 search-toggler d-nav-none"} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <i className="icon icon-sm icon-search icon-color-white"/>
            </button>
            <NavbarToggler className={classNames("me-4", {"open": isOpen})} onClick={() => setIsOpen(!isOpen)} />

            <MenuOpenContext.Provider value={{menuOpen: isOpen, setMenuOpen: setIsOpen}}>
                <Collapse className={"search-collapse p-3 p-nav-0 me-nav-2 border-nav-0"} isOpen={isSearchOpen} navbar>
                    <AdaHeaderSearch className={"ms-nav-2 d-nav-inline-block d-block"} onSearch={(s) => {
                        void navigate(`/search?query=${encodeURIComponent(s)}`);
                        closeWholeNavbar();
                    }} clearOnSearch />
                </Collapse>
                <Collapse isOpen={isOpen} navbar>
                    <Nav navbar className={"w-100"}>
                        <NavigationSection topLevelLink to="/" title={"Home"}/>

                        <NavigationSection title="Resources">
                            <LinkItem to="/topics">{t('topics', 'Topics')}</LinkItem>
                            <LinkItem to={PATHS.QUESTION_FINDER}>{t('questions', 'Questions')}</LinkItem>
                            <LinkItem to="/projects">{t('projects', 'Projects')}</LinkItem>
                            <LinkItem to="/glossary">{t('glossary', 'Glossary')}</LinkItem>
                            <LinkItem to={"/exam_specifications"}>{t('specifications', 'Specifications')}</LinkItem>
                        </NavigationSection>

                        <NavigationSection title="Students">
                            <LinkItem to="/students">{t('adaCsForStudents', 'Ada CS for students')}</LinkItem>
                            <LinkItem to="/pages/stem_smart_programme">{t('stemSmart', 'STEM SMART')}</LinkItem>
                            <LinkItem to="/pages/student_challenges">{t('challenges', 'Challenges')}</LinkItem>
                            <LinkItem to="/support/student">{t('support', 'Support')}</LinkItem>
                        </NavigationSection>

                        <NavigationSection title="Teachers">
                            <LinkItem to="/teachers">{t('adaCsForTeachers', 'Ada CS for teachers')}</LinkItem>
                            <LinkItem to="/teaching_order">{t('suggestedTeachingOrder', 'Suggested teaching order')}</LinkItem>
                            <LinkItem to="/pages/online_courses">{t('onlineCourses', 'Online courses')}</LinkItem>
                            <LinkItem to="/teacher_mentoring">{t('mentoringProgramme', 'Mentoring programme')}</LinkItem>
                            <LinkItem to="/support/teacher">{t('support', 'Support')}</LinkItem>
                        </NavigationSection>

                        <NavigationSection className={"text-start-nav"} topLevelLink to="/contact" title={"Contact us"}/>

                        <div className={"navbar-separator d-nav-none d-block"}/>

                        <div className={"ms-nav-auto"}></div>
                        
                        {(isStaff(user) || isEventLeader(user) || isNonProd) && <NavigationSection title={isStaff(user) || isEventLeader(user) ? "Admin" : "Staging"}>
                            {isStaff(user) && <LinkItem to="/admin">{t('adminTools2', 'Admin tools')}</LinkItem>}
                            {isAdmin(user) && <LinkItem to="/admin/usermanager">{t('userManager2', 'User manager')}</LinkItem>}
                            {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">{t('eventAdmin2', 'Event admin')}</LinkItem>}
                            {isStaff(user) && <LinkItem to="/admin/stats">{t('siteStatistics2', 'Site statistics')}</LinkItem>}
                            {(isStaff(user) || isNonProd) && <LinkItem to="/admin/content_errors">{t('contentErrors2', 'Content errors')}</LinkItem>}
                            {isNonProd && <>
                                <hr />
                                <LinkItemButton onClick={() => {
                                    dispatch(openActiveModal(FeatureFlagModal));
                                }}>
                                    {t('featureFlags2', 'Feature flags')}
                                    {hasActiveFeatureFlagOverrides() && <span className="ms-3 bg-turquoise-blue active-dot" />}
                                </LinkItemButton>
                            </>}
                        </NavigationSection>}

                        {isLoggedIn(user)
                            ? <>
                                <NavigationSection topLevelLink to="/dashboard" title={<>{t('myAda', 'My Ada')} {<MenuBadge count={notifications.length} message="notifications" data-testid="my-notifications-badge" />}</>} />
                                <div className={"navbar-separator d-nav-none d-block"}/>
                                <NavigationSection className={"text-center text-start-nav"} topLevelLink to="/logout" title={t('logOut2', 'Log out')}/>
                            </>
                            : <>
                                <NavigationSection className={"text-center text-start-nav"} topLevelLink to="/register" title={t('signUp2', 'Sign up')}/>
                                <NavigationSection className={"text-center text-start-nav"} topLevelLink to="/login" title={t('logIn2', 'Log in')}/>
                            </>
                        }

                        <div className={"navbar-separator d-nav-none d-block"}/>
                    </Nav>
                </Collapse>
            </MenuOpenContext.Provider>
        </Navbar>
    </header>;
};
