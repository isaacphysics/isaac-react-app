import React from "react";
import {LinkItem, NavigationBar, NavigationSection, useAssignmentBadge} from "../../navigation/NavigationBar";
import {useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {isAdmin, isAdminOrEventManager, isEventLeader, isStaff} from "../../../services/user";

export const NavigationBarCS = () => {
    const user = useSelector((state: AppState) => (state && state.user) || null);
    const assignmentBadge = useAssignmentBadge();

    return <NavigationBar>
        <NavigationSection title="About us">
            <LinkItem to="/about">What we do</LinkItem>
            <LinkItem to="/events">Events</LinkItem>
        </NavigationSection>

        <NavigationSection title={<React.Fragment>For students {assignmentBadge}</React.Fragment>}>
            <LinkItem to="/students">For students</LinkItem>
            <LinkItem to="/assignments">My assignments {assignmentBadge}</LinkItem>
            <LinkItem to="/my_gameboards">My gameboards</LinkItem>
            <LinkItem to="/progress">My progress</LinkItem>
            {/* <LinkItemComingSoon>Problem-solving</LinkItemComingSoon> */}
        </NavigationSection>

        <NavigationSection title="For teachers">
            <LinkItem to="/teachers">For teachers</LinkItem>
            <LinkItem to="/set_assignments">Set assignments</LinkItem>
            <LinkItem to="/assignment_progress">Assignment progress</LinkItem>
            <LinkItem to="/groups">Manage groups</LinkItem>
        </NavigationSection>

        <NavigationSection title="Topics">
            <LinkItem to="/topics">All topics</LinkItem>
            <LinkItem to="/teaching_order">Suggested teaching</LinkItem>
            <LinkItem to="/pages/specification_page_aqa">AQA specification view</LinkItem>
            <LinkItem to="/pages/specification_page_ocr">OCR specification view</LinkItem>
        </NavigationSection>

        <NavigationSection title={<React.Fragment>
            <span className="d-md-none d-lg-inline">Help and support</span>
            <span className="d-none d-md-inline d-lg-none">Support</span>
        </React.Fragment>}>
            <LinkItem to="/support/teacher">Teacher support</LinkItem>
            <LinkItem to="/support/student">Student support</LinkItem>
            <LinkItem to="/contact">Contact us</LinkItem>
        </NavigationSection>

        {(isStaff(user) || isEventLeader(user)) && <NavigationSection title="Admin">
            {isStaff(user) && <LinkItem to="/admin">Admin tools</LinkItem>}
            {isAdmin(user) && <LinkItem to="/admin/usermanager">User manager</LinkItem>}
            {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">Event admin</LinkItem>}
            {isStaff(user) && <LinkItem to="/admin/stats">Site statistics</LinkItem>}
            {isStaff(user) && <LinkItem to="/admin/content_errors">Content errors</LinkItem>}
        </NavigationSection>}
    </NavigationBar>
};
