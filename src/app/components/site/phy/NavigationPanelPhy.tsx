import React from "react";
import { LinkItem, NavigationSection } from "../../navigation/NavigationBar";
import { Nav, NavProps } from "reactstrap";
import classNames from "classnames";
import { isAdmin, isAdminOrEventManager, isEventLeader, isStaff, isTutor } from "../../../services";
import { selectors, useAppSelector } from "../../../state";

export const NavigationPanelPhy = (props: NavProps) => {
    const user = useAppSelector(selectors.user.orNull);
    // const {assignmentsCount, quizzesCount} = useAssignmentsCount();
    
    return <Nav {...props} navbar className={classNames("justify-content-between", props.className)} id="main-menu">
        <NavigationSection topLevelLink to="/about" title={"About Isaac"}/>
        <NavigationSection topLevelLink to="/questions" title={"Question finder"}/>
        <NavigationSection topLevelLink to="/concepts" title={"Concepts"}/>
        <NavigationSection topLevelLink to="/news" title={"News"}/>
        <NavigationSection topLevelLink to="/events" title={"Events"}/>
        <NavigationSection topLevelLink to="/publications" title={"Books"}/>
        <NavigationSection title={"Help"}>
            <LinkItem to="/pages/how_to_videos">How-to videos</LinkItem>
            <LinkItem to="/solving_problems">Problem-solving guide</LinkItem>
            <LinkItem to="/support/student">Student FAQ</LinkItem>
            {isTutor(user)
                ? <LinkItem to="/support/tutor">Tutor FAQ</LinkItem>
                : <LinkItem to="/support/teacher">Teacher FAQ</LinkItem>}
            <LinkItem to="/glossary">Glossary</LinkItem>
            <LinkItem to="/contact">Contact Us</LinkItem>
        </NavigationSection>

        {(isStaff(user) || isEventLeader(user)) && <NavigationSection title={<i className="icon icon-cog no-print align-text-bottom" aria-label="Admin"/>} className="border-start align-content-center">
            {isStaff(user) && <LinkItem to="/admin">Admin Tools</LinkItem>}
            {isAdmin(user) && <LinkItem to="/admin/usermanager">User Manager</LinkItem>}
            {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">Event Admin</LinkItem>}
            {isStaff(user) && <LinkItem to="/admin/stats">Site Statistics</LinkItem>}
            {isStaff(user) && <LinkItem to="/admin/content_errors">Content Errors</LinkItem>}
        </NavigationSection>}
    </Nav>;

        // TODO clean comments when navigation is done

        {/* <NavigationSection title={<>My Isaac {<MenuBadge data-testid={"my-assignments-badge"} count={assignmentsCount + quizzesCount} message="incomplete assignments and tests" />}</>}>
            <LinkItem to="/account" muted={!isLoggedIn(user)}>My Account</LinkItem>
            <LinkItem to={PATHS.MY_GAMEBOARDS} muted={!isLoggedIn(user)}>My Gameboards</LinkItem>
            <LinkItem to={PATHS.MY_ASSIGNMENTS} muted={!isLoggedIn(user)}>My Assignments {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}</LinkItem>
            <LinkItem to="/progress" muted={!isLoggedIn(user)}>My Progress</LinkItem>
            <LinkItem to="/tests" muted={!isLoggedIn(user)}>My Tests {<MenuBadge count={quizzesCount} message="incomplete tests" />}</LinkItem>
        </NavigationSection>

        {isTutorOrAbove(user) && <NavigationSection title="Teach">
            {isTeacherOrAbove(user) ? <LinkItem to="/teacher_features">Teacher Features</LinkItem> : <LinkItem to="/tutor_features">Tutor Features</LinkItem>}
            <LinkItem to="/groups">Manage Groups</LinkItem>
            <LinkItem to={PATHS.SET_ASSIGNMENTS}>Set Assignments</LinkItem>
            <LinkItem to={"/assignment_schedule"}>Assignment Schedule</LinkItem>
            <LinkItem to={PATHS.ASSIGNMENT_PROGRESS}>Assignment Progress</LinkItem>
            {isTeacherOrAbove(user) && <>
                <LinkItem to="/set_tests">Set / Manage Tests</LinkItem>
            </>}
        </NavigationSection>}

        <NavigationSection title="Learn">
            <LinkItem to="/11_14">11-14 Resources</LinkItem>
            <LinkItem to="/gcse">GCSE Resources</LinkItem>
            <LinkItem to="/alevel">A Level Resources</LinkItem>
            <LinkItem to={PATHS.QUESTION_FINDER}>Question Finder</LinkItem>
            <LinkItem to="/practice_tests">Practice Tests</LinkItem>
            <LinkItem to="/concepts">Concepts</LinkItem>
            <LinkItem to="/glossary">Glossary</LinkItem>
        </NavigationSection>

        <NavigationSection title="Events">
            {isLoggedIn(user) && <LinkItem to="/events?show_booked_only=true">My Booked Events</LinkItem>}
            <LinkItem to="/events">All Events</LinkItem>
            <LinkItem to="/pages/isaac_mentor">Student Mentoring</LinkItem>
            <LinkItem to="/pages/spc">Senior Physics Challenge</LinkItem>
            <LinkItem to="/pages/stem_smart">STEM SMART</LinkItem>
        </NavigationSection>

        <NavigationSection title="Help">
            <LinkItem to="/pages/how_to_videos">How-to Videos</LinkItem>
            <LinkItem to="/solving_problems">Problem Solving Guide</LinkItem>
            <LinkItem to="/support/student">Student FAQ</LinkItem>
            {isTutor(user)
                ? <LinkItem to="/support/tutor">Tutor FAQ</LinkItem>
                : <LinkItem to="/support/teacher">Teacher FAQ</LinkItem>}
            <LinkItem to="/contact">Contact Us</LinkItem>
        </NavigationSection> */ }

        {/* <div className="header-search m-md-0 ms-md-auto align-items-center d-print-none pt-3">
            <MainSearch />
        </div> */}
};
