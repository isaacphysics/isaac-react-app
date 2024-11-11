import React from "react";
import { LinkItem, MenuBadge, NavBar, NavigationSection, useAssignmentsCount } from "../navigation/NavBar";
import { useAppSelector, selectors } from "../../state";
import {
  isAdmin,
  isAdminOrEventManager,
  isEventLeader,
  isStaff,
  isTeacherOrAbove,
  isTutorOrAbove,
} from "../../services";

export const NavigationBar = () => {
  const user = useAppSelector(selectors.user.orNull);
  const { assignmentsCount, quizzesCount } = useAssignmentsCount();

  return (
    <NavBar>
      <NavigationSection
        title={
          <>
            My Isaac {<MenuBadge count={assignmentsCount + quizzesCount} message="incomplete assignments and tests" />}
            {<img src="/assets/Vector.svg" alt="Icon" className="svgIcon" />}
          </>
        }
      >
        <LinkItem to="/assignments">
          My assignments {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}
        </LinkItem>
        <LinkItem to="/my_gameboards">My gameboards</LinkItem>
        <LinkItem to="/progress">My progress</LinkItem>
        <LinkItem to="/tests">My tests {<MenuBadge count={quizzesCount} message="incomplete tests" />}</LinkItem>
      </NavigationSection>

      {isTutorOrAbove(user) && (
        <NavigationSection title="Teachers" svgIcon={<img src="/assets/Vector.svg" alt="Icon" className="svgIcon" />}>
          <LinkItem to="/groups">Manage groups</LinkItem>
          <LinkItem to="/set_assignments">Set assignments</LinkItem>
          <LinkItem to="/my_markbook">Markbook</LinkItem>
          {isTeacherOrAbove(user) && (
            <>
              <LinkItem to="/set_tests">Manage tests</LinkItem>
              <LinkItem to="/teaching_order_g_ocr">GCSE suggested teaching order (OCR)</LinkItem>
              <LinkItem to="/teaching_order_g_aqa">GCSE suggested teaching order (AQA)</LinkItem>
              <LinkItem to="/teaching_order">A Level suggested teaching order</LinkItem>
            </>
          )}
        </NavigationSection>
      )}

      <NavigationSection title="Learn" svgIcon={<img src="/assets/Vector.svg" alt="Icon" className="svgIcon" />}>
        {isTeacherOrAbove(user) && <LinkItem to="/pages/workbooks_2020">Workbooks</LinkItem>}
        <LinkItem to="/topics/gcse">GCSE topics</LinkItem>
        <LinkItem to="/topics/a_level">A level topics</LinkItem>
        <LinkItem to="/gameboards/new">Question Finder</LinkItem>
        <LinkItem to="/pages/computer_science_journeys_gallery">Computer Science Journeys</LinkItem>
        <LinkItem to="/careers_in_computer_science">Careers in Computer Science</LinkItem>
        <LinkItem to="/glossary">Glossary</LinkItem>
      </NavigationSection>

      <NavigationSection title="Events" svgIcon={<img src="/assets/Vector.svg" alt="Icon" className="svgIcon" />}>
        {isTeacherOrAbove(user) && <LinkItem to="/events?show_reservations_only=true">My event reservations</LinkItem>}
        <LinkItem to="/events">Events</LinkItem>
        <LinkItem to="/safeguarding">Safeguarding</LinkItem>
      </NavigationSection>

      {(isStaff(user) || isEventLeader(user)) && (
        <NavigationSection title="Admin" svgIcon={<img src="/assets/Vector.svg" alt="Icon" className="svgIcon" />}>
          {isStaff(user) && <LinkItem to="/admin">Admin tools</LinkItem>}
          {isAdmin(user) && <LinkItem to="/admin/usermanager">User manager</LinkItem>}
          {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">Event admin</LinkItem>}
          {isStaff(user) && <LinkItem to="/admin/stats">Site statistics</LinkItem>}
          {isStaff(user) && <LinkItem to="/admin/content_errors">Content errors</LinkItem>}
        </NavigationSection>
      )}
    </NavBar>
  );
};
