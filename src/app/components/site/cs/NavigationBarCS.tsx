import React from "react";
import {
    LinkItem,
    MenuBadge,
    NavigationBar,
    NavigationSection,
    useAssignmentsCount
} from "../../navigation/NavigationBar";
import {useAppSelector, selectors} from "../../../state";
import {isAdmin, isAdminOrEventManager, isEventLeader, isStaff, isTeacher} from "../../../services";

export const NavigationBarCS = () => {
    const user = useAppSelector(selectors.user.orNull);
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();

    return <NavigationBar>
        <NavigationSection title={<>My Isaac {<MenuBadge count={assignmentsCount + quizzesCount} message="incomplete assignments and tests" />}</>}>
            <LinkItem to="/assignments">My assignments {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}</LinkItem>
            <LinkItem to="/my_gameboards">My gameboards</LinkItem>
            <LinkItem to="/progress">My progress</LinkItem>
            <LinkItem to="/tests">My tests {<MenuBadge count={quizzesCount} message="incomplete tests" />}</LinkItem>
            <LinkItem to="/student_rewards">Student rewards</LinkItem>
        </NavigationSection>

        {isTeacher(user) && <NavigationSection title="Teachers">
            <LinkItem to="/groups">Manage groups</LinkItem>
            <LinkItem to="/set_assignments">Set assignments</LinkItem>
            <LinkItem to="/assignment_progress">Markbook</LinkItem>
            <LinkItem to="/set_tests">Manage tests</LinkItem>
            <LinkItem to="/teaching_order">Suggested teaching order</LinkItem>
        </NavigationSection>}

        <NavigationSection title="Learn">
            <LinkItem to="/topics/gcse">GCSE topics</LinkItem>
            <LinkItem to="/topics/a_level">A level topics</LinkItem>
            <LinkItem to="/gameboards/new">Question Finder</LinkItem>
            <LinkItem to="/pages/workbooks_2020">Workbooks</LinkItem>
            <LinkItem to="/glossary">Glossary</LinkItem>
            <LinkItem to="/pages/computer_science_journeys_gallery">Computer science journeys</LinkItem>
        </NavigationSection>

        <NavigationSection title="Events">
            {isTeacher(user) && <LinkItem to="/events?show_reservations_only=true">My event reservations</LinkItem>}
            <LinkItem to="/events?types=student">Student events</LinkItem>
            <LinkItem to="/events?types=teacher">Teacher events</LinkItem>
            <LinkItem to="/pages/event_types">Event formats</LinkItem>
            <LinkItem to="/safeguarding">Safeguarding</LinkItem>
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
