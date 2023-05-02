import React, {lazy} from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {AllTopics} from "../../pages/AllTopics";
import StaticPageRoute from "../../navigation/StaticPageRoute";
import {Topic} from "../../pages/Topic";
import {Redirect} from "react-router";
import {isStaff, isTutorOrAbove} from "../../../services";
import {SingleAssignmentProgress} from "../../pages/SingleAssignmentProgress";
import {Glossary} from "../../pages/Glossary";
import {ExamSpecifications} from "../../pages/ExamSpecifications";
import {News} from "../../pages/News";

const Equality = lazy(() => import('../../pages/Equality'));

let key = 0;
export const RoutesCS = [
    // Student and teacher
    // <TrackedRoute key={key++} exact path="/students" component={Students} />,
    // <TrackedRoute key={key++} exact path="/teachers" component={TeacherTools} />,
    <Redirect key={key++} exact from="/students" to="/support/student/general" />,
    <Redirect key={key++} exact from="/teachers" to="/support/teacher/general" />,

    // Assignments
    <Redirect key={key++} from="/assignment_progress" to="/my_markbook" />,
    <TrackedRoute key={key++} exact path="/my_markbook/:assignmentId" ifUser={isTutorOrAbove} component={SingleAssignmentProgress} />,
    <Redirect key={key++} from="/assignment_progress/:assignmentId" to="/my_markbook/:assignmentId" />,

    // Topics and content
    <TrackedRoute key={key++} exact path="/topics" component={AllTopics} />,
    <TrackedRoute key={key++} exact path="/topics/:topicName" component={Topic} />,
    <TrackedRoute key={key++} exact path="/exam_specifications" component={ExamSpecifications} />,

    // News
    <TrackedRoute key={key++} exact path="/news" component={News} />,

    // Books: FIXME ADA are we going to include these?
    // <TrackedRoute key={key++} exact path="/books/workbook_20_aqa" component={Workbook20AQA}/>,
    // <TrackedRoute key={key++} exact path="/books/workbook_20_ocr" component={Workbook20OCR}/>,

    // Glossary:
    <TrackedRoute key={key++} exact path="/glossary" component={Glossary} />,

    // Static pages:
    <StaticPageRoute key={key++} exact path="/about" pageId="about_us" />,
    <StaticPageRoute key={key++} exact path="/safeguarding" pageId="events_safeguarding" />,
    <StaticPageRoute key={key++} exact path="/teaching_order" pageId="teaching_order" />,
    // <StaticPageRoute key={key++} exact path="/student_rewards" pageId="student_rewards_programme" />,
    // <StaticPageRoute key={key++} exact path="/teachcomputing" pageId="teach_computing" />,

    // <StaticPageRoute key={key++} exact ifUser={isEventLeaderOrStaff} path="/events_toolkit" pageId="fragments/event_leader_event_toolkit_fragment" />,

    // <TrackedRoute key={key++} exact path="/coming_soon" component={ComingSoon} />,
    <TrackedRoute key={key++} exact path="/equality" ifUser={isStaff} component={Equality} />,
];
