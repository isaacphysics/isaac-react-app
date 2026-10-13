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
import { useTranslation } from "react-i18next";

export const HeaderCS = () => {
    const { t } = useTranslation();
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
                <img src="/assets/common/logos/ada_logo_3-stack_aqua_white_text.svg" alt={t("ada:navigation.logoAlt")} />
            </NavbarBrand>

            <a href={`#${mainContentId}`} className="skip-main position-absolute">{t("ada:navigation.skipToContent")}</a>

            <button aria-label={t("ada:navigation.toggleSearch")} className={"ms-auto me-4 search-toggler d-nav-none"} onClick={() => setIsSearchOpen(!isSearchOpen)}>
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
                        <NavigationSection topLevelLink to="/" title={t("ada:navigation.home")}/>

                        <NavigationSection title={t("ada:navigation.resources.title")}>
                            <LinkItem to="/topics">{t("ada:navigation.resources.topics")}</LinkItem>
                            <LinkItem to={PATHS.QUESTION_FINDER}>{t("ada:navigation.resources.questions")}</LinkItem>
                            <LinkItem to="/projects">{t("ada:navigation.resources.projects")}</LinkItem>
                            <LinkItem to="/glossary">{t("ada:navigation.resources.glossary")}</LinkItem>
                            <LinkItem to={"/exam_specifications"}>{t("ada:navigation.resources.specifications")}</LinkItem>
                        </NavigationSection>

                        <NavigationSection title={t("ada:navigation.students.title")}>
                            <LinkItem to="/students">{t("ada:navigation.students.landingPage")}</LinkItem>
                            <LinkItem to="/pages/stem_smart_programme">{t("ada:navigation.students.stemSmart")}</LinkItem>
                            <LinkItem to="/pages/student_challenges">{t("ada:navigation.students.challenges")}</LinkItem>
                            <LinkItem to="/support/student">{t("ada:navigation.students.support")}</LinkItem>
                        </NavigationSection>

                        <NavigationSection title={t("ada:navigation.teachers.title")}>
                            <LinkItem to="/teachers">{t("ada:navigation.teachers.landingPage")}</LinkItem>
                            <LinkItem to="/teaching_order">{t("ada:navigation.teachers.teachingOrder")}</LinkItem>
                            <LinkItem to="/pages/online_courses">{t("ada:navigation.teachers.onlineCourses")}</LinkItem>
                            <LinkItem to="/teacher_mentoring">{t("ada:navigation.teachers.mentoring")}</LinkItem>
                            <LinkItem to="/support/teacher">{t("ada:navigation.teachers.support")}</LinkItem>
                        </NavigationSection>

                        <NavigationSection className={"text-start-nav me-nav-auto navbar-separator"} topLevelLink to="/contact" title={t("ada:navigation.contactUs")}/>

                        {(isStaff(user) || isEventLeader(user) || isNonProd) && <NavigationSection title={isStaff(user) || isEventLeader(user) ? t("ada:navigation.admin.title") : t("ada:navigation.staging.title")}>
                            {isStaff(user) && <LinkItem to="/admin">{t("ada:navigation.admin.tools")}</LinkItem>}
                            {isAdmin(user) && <LinkItem to="/admin/usermanager">{t("ada:navigation.admin.userManager")}</LinkItem>}
                            {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">{t("ada:navigation.admin.events")}</LinkItem>}
                            {isStaff(user) && <LinkItem to="/admin/stats">{t("ada:navigation.admin.siteStatistics")}</LinkItem>}
                            {(isStaff(user) || isNonProd) && <LinkItem to="/admin/content_errors">{t("ada:navigation.admin.contentErrors")}</LinkItem>}
                            {isNonProd && <>
                                <hr />
                                <LinkItemButton onClick={() => {
                                    dispatch(openActiveModal(FeatureFlagModal));
                                }}>
                                    {t("ada:navigation.admin.featureFlags")}
                                    {hasActiveFeatureFlagOverrides() && <span className="ms-3 bg-turquoise-blue active-dot" />}
                                </LinkItemButton>
                            </>}
                        </NavigationSection>}

                        {isLoggedIn(user)
                            ? <>
                                <NavigationSection className={"navbar-separator"} topLevelLink to="/dashboard" title={<>{t("ada:navigation.dashboard")} {<MenuBadge count={notifications.length} message="notifications" data-testid="my-notifications-badge" />}</>} />
                                <NavigationSection className={"text-center text-start-nav navbar-separator"} topLevelLink to="/logout" title={t("ada:navigation.logout")}/>
                            </>
                            : <>
                                <NavigationSection className={"text-center text-start-nav"} topLevelLink to="/register" title={t("ada:navigation.signUp")}/>
                                <NavigationSection className={"text-center text-start-nav navbar-separator"} topLevelLink to="/login" title={t("ada:navigation.logIn")}/>
                            </>
                        }
                    </Nav>
                </Collapse>
            </MenuOpenContext.Provider>
        </Navbar>
    </header>;
};
