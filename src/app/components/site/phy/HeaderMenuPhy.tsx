import React from "react";
import { LinkItem, NavigationSection } from "../../navigation/NavigationBar";
import { Nav, NavProps } from "reactstrap";
import classNames from "classnames";
import { above, below, isAdmin, isAdminOrEventManager, isEventLeader, isStaff, isTutor, useDeviceSize } from "../../../services";
import { selectors, useAppSelector } from "../../../state";
import { NavigationMenuPhy } from "./NavigationMenuPhy";

export const HeaderMenuPhy = (props: NavProps & {toggleMenu: () => void}) => {
    const { toggleMenu, ...rest } = props;
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();
    const isOffcanvas = !above["lg"](deviceSize);
    const isContentNavVisible = below["sm"](deviceSize);
    const isAdminTabVisible = user && isStaff(user) || isEventLeader(user);
    
    return <Nav {...rest} navbar className={classNames("justify-content-between", rest.className, "pe-0", {"pe-md-3" : !isAdminTabVisible})} id="main-menu">
        {isContentNavVisible && <>
            <NavigationMenuPhy toggleMenu={toggleMenu}/>
            <div className="my-3"/>
        </>}
        {isOffcanvas && <NavigationSection topLevelLink to="/" title={"Home"}/>}
        <NavigationSection topLevelLink to="/about" title={"About Isaac"}/>
        <NavigationSection topLevelLink to="/questions" title={"Question finder"}/>
        <NavigationSection topLevelLink to="/concepts" title={"Concepts"}/>
        <NavigationSection topLevelLink to="/news" title={"News"}/>
        <NavigationSection topLevelLink to="/events" title={"Events"}/>
        <NavigationSection topLevelLink to="/books" title={"Books"}/>
        <NavigationSection title={"Help"} className={classNames({"border-end" : !isOffcanvas})}>
            <ul className="plain-list">
                <LinkItem to="/pages/how_to_videos">How-to videos</LinkItem>
                <LinkItem to="/solving_problems">Problem-solving guide</LinkItem>
                <LinkItem to="/support/student">Student FAQ</LinkItem>
                {isTutor(user)
                    ? <LinkItem to="/support/tutor">Tutor FAQ</LinkItem>
                    : <LinkItem to="/support/teacher">Teacher FAQ</LinkItem>}
                <LinkItem to="/glossary">Glossary</LinkItem>
                <LinkItem to="/contact">Contact Us</LinkItem>
            </ul>
        </NavigationSection>

        {isAdminTabVisible && <NavigationSection 
            title={isOffcanvas ? "Admin" : <i className="icon icon-cog icon-color-black no-print align-text-bottom" aria-label="Admin"/>} 
            className={classNames({"align-content-center" : !isOffcanvas})}
        >
            <ul className="plain-list">
                {isStaff(user) && <LinkItem to="/admin">Admin Tools</LinkItem>}
                {isAdmin(user) && <LinkItem to="/admin/usermanager">User Manager</LinkItem>}
                {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">Event Admin</LinkItem>}
                {isStaff(user) && <LinkItem to="/admin/stats">Site Statistics</LinkItem>}
                {isStaff(user) && <LinkItem to="/admin/content_errors">Content Errors</LinkItem>}
            </ul>
        </NavigationSection>}
    </Nav>;
};
