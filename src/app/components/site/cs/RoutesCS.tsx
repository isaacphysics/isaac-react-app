import React from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {AllTopics} from "../../pages/AllTopics";
import StaticPageRoute from "../../navigation/StaticPageRoute";
import {ComingSoon} from "../../pages/ComingSoon";
import {Topic} from "../../pages/Topic";
import {Students} from "../../pages/Students";
import {TeacherTools} from "../../pages/TeacherTools";
import {AssignmentProgress} from "../../pages/AssignmentProgress";
import {Redirect} from "react-router";
import {isTeacher} from "../../../services/user";
import {SingleAssignmentProgress} from "../../pages/SingleAssignmentProgress";
import {Workbook20AQA} from "../../pages/books/Workbook20AQA";
import {Workbook20OCR} from "../../pages/books/Workbook20OCR";

let key = 0;
export const RoutesCS = [
    // Student and teacher
    <TrackedRoute key={key++} exact path="/students" component={Students} />,
    <TrackedRoute key={key++} exact path="/teachers" component={TeacherTools} />,

    // Assignments
    <TrackedRoute key={key++} exact path="/my_markbook" component={AssignmentProgress} />,
    <Redirect key={key++} from="/assignment_progress" to="/my_markbook" />,
    <TrackedRoute key={key++} exact path="/my_markbook/:assignmentId" ifUser={isTeacher} component={SingleAssignmentProgress} />,
    <Redirect key={key++} from="/assignment_progress/:assignmentId" to="/my_markbook/:assignmentId" />,

    // Topics
    <TrackedRoute key={key++} exact path="/topics/:topicName" component={Topic} />,
    <TrackedRoute key={key++} exact path="/topics" component={AllTopics} />,

    // Books:
    <TrackedRoute key={key++} exact path="/books/workbook_20_aqa" component={Workbook20AQA}/>,
    <TrackedRoute key={key++} exact path="/books/workbook_20_ocr" component={Workbook20OCR}/>,
    // Static pages:
    <StaticPageRoute key={key++} exact path="/about" pageId="about_us" />,
    <StaticPageRoute key={key++} exact path="/teaching_order" pageId="teaching_order" />,
    <StaticPageRoute key={key++} exact path="/student_rewards" pageId="student_rewards_programme" />,

    <TrackedRoute key={key++} exact path="/coming_soon" component={ComingSoon} />,
];
