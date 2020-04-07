import React from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {AllTopics} from "../../pages/AllTopics";
import StaticPageRoute from "../../navigation/StaticPageRoute";
import {ComingSoon} from "../../pages/ComingSoon";
import {Topic} from "../../pages/Topic";
import {ForStudents} from "../../pages/ForStudents";
import {ForTeachers} from "../../pages/ForTeachers";
import {AssignmentProgress} from "../../pages/AssignmentProgress";
import {Redirect} from "react-router";

let key = 0;
export const RoutesCS = [
    // Student and teacher
    <TrackedRoute key={key++} exact path="/students" component={ForStudents} />,
    <TrackedRoute key={key++} exact path="/teachers" component={ForTeachers} />,

    // Assignments
    <TrackedRoute key={key++} exact path="/my_markbook" component={AssignmentProgress} />,
    <Redirect key={key++} from="/assignment_progress" to="/my_markbook" />,

    // Topics
    <TrackedRoute key={key++} exact path="/topics/:topicName" component={Topic} />,
    <TrackedRoute key={key++} exact path="/topics" component={AllTopics} />,

    // Static pages:
    <StaticPageRoute key={key++} exact path="/about" pageId="about_us" />,
    <StaticPageRoute key={key++} exact path="/teaching_order" pageId="teaching_order" />,
    <StaticPageRoute key={key++} exact path="/student_rewards" pageId="student_rewards_programme" />,

    <TrackedRoute key={key++} exact path="/coming_soon" component={ComingSoon} />,
];
