import React from "react";
import {
    LinkItem,
    MenuBadge,
    NavigationBar,
    NavigationSection,
    useAssignmentsCount
} from "../../navigation/NavigationBar";
import {useAppSelector, selectors} from "../../../state";
import {
    isAdmin,
    isAdminOrEventManager,
    isEventLeader,
    isStaff,
    isTeacherOrAbove, isTutorOrAbove
} from "../../../services";

export const NavigationBarCS = () => {
    const user = useAppSelector(selectors.user.orNull);
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();

    return <NavigationBar>
        <NavigationSection topLevelLink to="/" title={"Home"} children={<></>}/>

        {isTutorOrAbove(user) && <NavigationSection title="Teachers">
            <LinkItem to="/groups">Manage groups</LinkItem>
            <LinkItem to="/set_assignments">Set assignments</LinkItem>
            <LinkItem to="/my_markbook">Markbook</LinkItem>
            {isTeacherOrAbove(user) && <>
                {/*<LinkItem to="/set_tests">Manage tests</LinkItem>*/}
                <LinkItem to="/teaching_order">Suggested teaching order</LinkItem>
            </>}
        </NavigationSection>}

        <NavigationSection title="Learn">
            <LinkItem to="/topics/gcse">GCSE topics</LinkItem>
            <LinkItem to="/topics/a_level">A level topics</LinkItem>
            <LinkItem to="/gameboards/new">Question Finder</LinkItem>
            <LinkItem to="/pages/workbooks_2020">Workbooks</LinkItem>
            <LinkItem to="/glossary">Glossary</LinkItem>
            <LinkItem to="/pages/computer_science_journeys_gallery">Computer science journeys</LinkItem>
        </NavigationSection>

        <NavigationSection title={<>My Ada {<MenuBadge count={assignmentsCount/* + quizzesCount*/} message="incomplete assignments" />}</>}>
            <LinkItem to="/assignments">My assignments {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}</LinkItem>
            <LinkItem to="/my_gameboards">My gameboards</LinkItem>
            <LinkItem to="/progress">My progress</LinkItem>
            {/*<LinkItem to="/tests">My tests {<MenuBadge count={quizzesCount} message="incomplete tests" />}</LinkItem>*/}
            <LinkItem to="/student_rewards">Student rewards</LinkItem>
        </NavigationSection>

        <NavigationSection title={"Help"}>
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
