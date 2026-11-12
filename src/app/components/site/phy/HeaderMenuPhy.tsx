import React from "react";
import { LinkItem, LinkItemButton, NavigationSection } from "../../navigation/NavigationBar";
import { Nav, NavProps } from "reactstrap";
import classNames from "classnames";
import { above, below, isAdmin, isAdminOrEventManager, isEventLeader, isStaff, isTutor, useDeviceSize } from "../../../services";
import { openActiveModal, selectors, useAppDispatch, useAppSelector, useGetSegueEnvironmentQuery } from "../../../state";
import { NavigationMenuPhy } from "./NavigationMenuPhy";
import { FeatureFlagModal, hasActiveFeatureFlagOverrides } from "../../../services/featureFlag";
import { useTranslation } from "react-i18next";

export const HeaderMenuPhy = (props: NavProps & {toggleMenu: () => void}) => {
    const { t } = useTranslation();
    const { toggleMenu, ...rest } = props;
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();
    const isOffcanvas = !above["lg"](deviceSize);
    const isContentNavVisible = below["sm"](deviceSize);

    const dispatch = useAppDispatch();
    const { data: env } = useGetSegueEnvironmentQuery();
    const isNonProd = env === "DEV";

    const isAdminTabVisible = user && isStaff(user) || isEventLeader(user) || isNonProd;
    
    return <Nav {...rest} navbar className={classNames("justify-content-between", rest.className, "pe-0", {"pe-md-3" : !isAdminTabVisible})} id="main-menu">
        {isContentNavVisible && <>
            <NavigationMenuPhy toggleMenu={toggleMenu}/>
            <div className="my-3"/>
        </>}
        {isOffcanvas && <NavigationSection topLevelLink to="/" title={t("common:button.home")}/>}
        {(isOffcanvas || above["xl"](deviceSize)) && <NavigationSection topLevelLink to="/about" title={t("sci:navigation.about")}/>}
        <NavigationSection topLevelLink to="/questions" title={t("common:title.questionFinder")}/>
        <NavigationSection topLevelLink to="/concepts" title={t("common:title.concepts")}/>
        <NavigationSection topLevelLink to="/view_tests" title={t("common:title.tests")}/>
        <NavigationSection topLevelLink to="/news" title={t("common:title.news")}/>
        <NavigationSection to="/events" title={t("common:title.events")}>
            <LinkItem to="/events">{t("common:title.events")}</LinkItem>
            <LinkItem to="/programmes">{t("sci:title.programmes")}</LinkItem>
        </NavigationSection>
        <NavigationSection topLevelLink to="/books" title={t("sci:navigation.books")}/>
        <NavigationSection title={t("common:button.help")} className={classNames({"border-end" : !isOffcanvas})}>
            {/* <LinkItem to="/pages/how_to_videos">How-to videos</LinkItem> -- bring back when updated content created! */}
            <LinkItem to="/solving_problems">{t("sci:navigation.help.problemSolving")}</LinkItem>
            <LinkItem to="/support/student">{t("sci:navigation.help.studentFaq")}</LinkItem>
            {isTutor(user)
                ? <LinkItem to="/support/tutor">{t("sci:title.tutorFaq")}</LinkItem>
                : <LinkItem to="/support/teacher">{t("sci:title.teacherFaq")}</LinkItem>}
            <LinkItem to="/glossary">{t("common:title.glossary")}</LinkItem>
            <LinkItem to="/contact">{t("sci:navigation.help.contact")}</LinkItem>
        </NavigationSection>

        {isAdminTabVisible && <NavigationSection 
            title={isOffcanvas 
                ? (isStaff(user) || isEventLeader(user)) ? t("common:title.admin") : t("common:title.staging")
                : <i className="icon icon-cog icon-color-black no-print align-text-bottom" aria-label={t("common:title.admin")}/>
            } 
            className={classNames({"align-content-center" : !isOffcanvas})}
        >
            {isStaff(user) && <LinkItem to="/admin">{t("sci:navigation.admin.tools")}</LinkItem>}
            {isAdmin(user) && <LinkItem to="/admin/usermanager">{t("common:admin.usefulLinks.userManager")}</LinkItem>}
            {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">{t("sci:navigation.admin.eventAdmin")}</LinkItem>}
            {isStaff(user) && <LinkItem to="/admin/stats">{t("sci:navigation.admin.statistics")}</LinkItem>}
            {(isStaff(user) || isNonProd) && <LinkItem to="/admin/content_errors">{t("sci:navigation.admin.contentErrors")}</LinkItem>}
            {isNonProd && <>
                <div className="section-divider"/>  
                <LinkItemButton onClick={() => {
                    dispatch(openActiveModal(FeatureFlagModal));
                }}>
                    {t("common:title.featureFlags")}
                    {hasActiveFeatureFlagOverrides() && <span className="ms-3 bg-primary active-dot" />}
                </LinkItemButton>
            </>}
        </NavigationSection>}
    </Nav>;
};
