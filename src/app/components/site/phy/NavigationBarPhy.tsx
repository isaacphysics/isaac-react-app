import {LinkItem, NavigationBar, NavigationSection, useAssignmentBadge} from "../../navigation/NavigationBar";
import React from "react";
import {useSelector} from "react-redux";
import {isAdmin, isAdminOrEventManager, isEventLeader, isLoggedIn, isStaff, isTeacher} from "../../../services/user";
import {selectors} from "../../../state/selectors";

export const NavigationBarPhy = () => {
    const user = useSelector(selectors.user.orNull);
    const assignmentBadge = useAssignmentBadge();

    return <NavigationBar>
        <NavigationSection title={<>My Isaac {assignmentBadge}</>}>
            <LinkItem to="/account" muted={!isLoggedIn(user)}>My Account</LinkItem>
            <LinkItem to="/my_gameboards" muted={!isLoggedIn(user)}>My Gameboards</LinkItem>
            <LinkItem to="/assignments" muted={!isLoggedIn(user)}>My Assignments {assignmentBadge}</LinkItem>
            <LinkItem to="/progress" muted={!isLoggedIn(user)}>My Progress</LinkItem>
        </NavigationSection>

        {isTeacher(user) && <NavigationSection title="Teach">
            <LinkItem to="/groups">Manage Groups</LinkItem>
            <LinkItem to="/gameboard_builder">Create Gameboard</LinkItem>
            <LinkItem to="/set_assignments">Set Assignments</LinkItem>
            <LinkItem to="/assignment_progress">Assignment Progress</LinkItem>
        </NavigationSection>}

        <NavigationSection title="Learn">
            <LinkItem to="/gcse">GCSE Resources</LinkItem>
            <LinkItem to="/alevel">A Level Resources</LinkItem>
            <LinkItem to="/gameboards/new">Question Finder</LinkItem>
            <LinkItem to="/concepts">Concept Reference</LinkItem>
        </NavigationSection>

        <NavigationSection title="Events">
            {isLoggedIn(user) && <LinkItem to="/events?show_booked_only=true">My Booked Events</LinkItem>}
            <LinkItem to="/events">All Events</LinkItem>
            <LinkItem to="/pages/isaac_mentor">Mentoring Schemes</LinkItem>
        </NavigationSection>

        <NavigationSection title="Help">
            <LinkItem to="/solving_problems">Problem Solving Guide</LinkItem>
            <LinkItem to="/support/student">Student FAQ</LinkItem>
            <LinkItem to="/support/teacher">Teacher FAQ</LinkItem>
            <LinkItem to="/contact">Contact Us</LinkItem>
        </NavigationSection>

        {(isStaff(user) || isEventLeader(user)) && <NavigationSection title="Admin">
            {isStaff(user) && <LinkItem to="/admin">Admin Tools</LinkItem>}
            {isAdmin(user) && <LinkItem to="/admin/usermanager">User Manager</LinkItem>}
            {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">Event Admin</LinkItem>}
            {isStaff(user) && <LinkItem to="/admin/stats">Site Statistics</LinkItem>}
            {isStaff(user) && <LinkItem to="/admin/content_errors">Content Errors</LinkItem>}
        </NavigationSection>}
    </NavigationBar>
};
