import React, {lazy} from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {AllTopics} from "../../pages/AllTopics";
import StaticPageRoute from "../../navigation/StaticPageRoute";
import {Topic} from "../../pages/Topic";
import {Redirect} from "react-router";
import {isLoggedIn, isStaff, isTeacherOrAbove, isTutorOrAbove} from "../../../services";
import {SingleAssignmentProgress} from "../../pages/SingleAssignmentProgress";
import {ExamSpecifications} from "../../pages/ExamSpecifications";
import {News} from "../../pages/News";
import {SetQuizzes} from "../../pages/quizzes/SetQuizzes";
import {MyQuizzes} from "../../pages/quizzes/MyQuizzes";
import {QuizDoAssignment} from "../../pages/quizzes/QuizDoAssignment";
import {QuizAttemptFeedback} from "../../pages/quizzes/QuizAttemptFeedback";
import {QuizTeacherFeedback} from "../../pages/quizzes/QuizTeacherFeedback";
import {QuizPreview} from "../../pages/quizzes/QuizPreview";
import {QuizDoFreeAttempt} from "../../pages/quizzes/QuizDoFreeAttempt";
import {TeacherAccountSelfUpgrade} from "../../pages/TeacherAccountSelfUpgrade";
import {RegistrationStart} from "../../pages/RegistrationStart";
import {RegistrationRoleSelect} from "../../pages/RegistrationRoleSelect";
import {RegistrationAgeCheck} from "../../pages/RegistrationAgeCheck";
import {RegistrationAgeCheckFailed} from "../../pages/RegistrationAgeCheckFailed";
import {RegistrationSetDetails} from "../../pages/RegistrationSetDetails";
import {RegistrationVerifyEmail} from "../../pages/RegistrationVerifyEmail";
import {RegistrationTeacherConnect} from "../../pages/RegistrationTeacherConnect";
import {RegistrationSetPreferences} from "../../pages/RegistrationSetPreferences";
import {RegistrationSuccess} from "../../pages/RegistrationSuccess";
import {Events} from "../../pages/Events";
import EventDetails from "../../pages/EventDetails";
import {RedirectToEvent} from "../../navigation/RedirectToEvent";
import { QuestionFinder } from "../../pages/QuestionFinder";

const Equality = lazy(() => import('../../pages/Equality'));

let key = 0;
export const RoutesCS = [

    // Registration flow
    <TrackedRoute key={key++} exact path="/register" component={RegistrationStart} />,
    <TrackedRoute key={key++} exact path="/register/role" component={RegistrationRoleSelect} />,
    <TrackedRoute key={key++} exact path="/register/student/age" component={RegistrationAgeCheck} />,
    <TrackedRoute key={key++} exact path="/register/student/age_denied" component={RegistrationAgeCheckFailed} />,
    <TrackedRoute key={key++} exact path="/register/student/details" component={RegistrationSetDetails} componentProps={{'role': 'STUDENT'}} />,
    <TrackedRoute key={key++} exact path="/register/teacher/details" component={RegistrationSetDetails} componentProps={{'role': 'TEACHER'}} />,
    <TrackedRoute key={key++} exact path="/verifyemail" component={RegistrationVerifyEmail} />,
    <TrackedRoute key={key++} exact path="/register/connect" ifUser={isLoggedIn} component={RegistrationTeacherConnect} />,
    <TrackedRoute key={key++} exact path="/register/preferences" ifUser={isLoggedIn} component={RegistrationSetPreferences} />,
    <TrackedRoute key={key++} exact path="/register/success" ifUser={isLoggedIn} component={RegistrationSuccess} />,


    // Student and teacher
    // <TrackedRoute key={key++} exact path="/students" component={Students} />,
    // <TrackedRoute key={key++} exact path="/teachers" component={TeacherTools} />,
    <Redirect key={key++} exact from="/students" to="/support/student/general" />,
    <Redirect key={key++} exact from="/teachers" to="/support/teacher/general" />,

    // Questions
    <TrackedRoute key={key++} exact path="/questions" component={QuestionFinder} />,

    // Assignments
    <Redirect key={key++} from="/assignment_progress" to="/my_markbook" />,
    <TrackedRoute key={key++} exact path="/my_markbook/:assignmentId" ifUser={isTutorOrAbove} component={SingleAssignmentProgress} />,
    <Redirect key={key++} from="/assignment_progress/:assignmentId" to="/my_markbook/:assignmentId" />,

    // Teacher test pages
    <TrackedRoute key={key++} exact path="/set_tests" ifUser={isTeacherOrAbove} component={SetQuizzes} />,
    // Student test pages
    <TrackedRoute key={key++} exact path="/tests" ifUser={isLoggedIn} component={MyQuizzes} />,

    // Quiz (test) pages
    <TrackedRoute key={key++} exact path="/test/assignment/:quizAssignmentId" ifUser={isLoggedIn} component={QuizDoAssignment} />,
    <TrackedRoute key={key++} exact path="/test/assignment/:quizAssignmentId/page/:page" ifUser={isLoggedIn} component={QuizDoAssignment} />,
    <TrackedRoute key={key++} exact path="/test/attempt/:quizAttemptId/feedback" ifUser={isLoggedIn} component={QuizAttemptFeedback} />,
    <TrackedRoute key={key++} exact path="/test/attempt/:quizAttemptId/feedback/:page" ifUser={isLoggedIn} component={QuizAttemptFeedback} />,
    <TrackedRoute key={key++} exact path="/test/attempt/feedback/:quizAssignmentId/:studentId" ifUser={isTeacherOrAbove} component={QuizAttemptFeedback} />,
    <TrackedRoute key={key++} exact path="/test/attempt/feedback/:quizAssignmentId/:studentId/:page" ifUser={isTeacherOrAbove} component={QuizAttemptFeedback} />,
    <TrackedRoute key={key++} exact path="/test/assignment/:quizAssignmentId/feedback" ifUser={isTeacherOrAbove} component={QuizTeacherFeedback} />,
    // Tutors can preview tests iff the test is student only
    <TrackedRoute key={key++} exact path="/test/preview/:quizId" ifUser={isTutorOrAbove} component={QuizPreview} />,
    <TrackedRoute key={key++} exact path="/test/preview/:quizId/page/:page" ifUser={isTutorOrAbove} component={QuizPreview} />,
    <TrackedRoute key={key++} exact path="/test/attempt/:quizId" ifUser={isLoggedIn} component={QuizDoFreeAttempt} />,
    <TrackedRoute key={key++} exact path="/test/attempt/:quizId/page/:page" ifUser={isLoggedIn} component={QuizDoFreeAttempt} />,

    // Topics and content
    <TrackedRoute key={key++} exact path="/topics" component={AllTopics} />,
    <TrackedRoute key={key++} exact path="/topics/:topicName" component={Topic} />,
    <TrackedRoute key={key++} exact path="/exam_specifications" component={ExamSpecifications} />,

    // News
    <TrackedRoute key={key++} exact path="/news" component={News} />,

    // Books: FIXME ADA are we going to include these?
    // <TrackedRoute key={key++} exact path="/books/workbook_20_aqa" component={Workbook20AQA}/>,
    // <TrackedRoute key={key++} exact path="/books/workbook_20_ocr" component={Workbook20OCR}/>,

    // Events
    <TrackedRoute key={key++} exact path='/events' component={Events}/>,
    <TrackedRoute key={key++} exact path='/events/:eventId' component={EventDetails}/>,
    <TrackedRoute key={key++} exact path='/eventbooking/:eventId' ifUser={isLoggedIn} component={RedirectToEvent} />,

    // Static pages:
    <StaticPageRoute key={key++} exact path="/about" pageId="about_us" />,
    <StaticPageRoute key={key++} exact path="/safeguarding" pageId="events_safeguarding" />,
    <StaticPageRoute key={key++} exact path="/teaching_order" pageId="teaching_order" />,
    <TrackedRoute key={key++} exact path="/teacher_account_request" ifUser={isLoggedIn} component={TeacherAccountSelfUpgrade}/>,

    // <StaticPageRoute key={key++} exact path="/student_rewards" pageId="student_rewards_programme" />,
    // <StaticPageRoute key={key++} exact path="/teachcomputing" pageId="teach_computing" />,

    // <StaticPageRoute key={key++} exact ifUser={isEventLeaderOrStaff} path="/events_toolkit" pageId="fragments/event_leader_event_toolkit_fragment" />,

    // <TrackedRoute key={key++} exact path="/coming_soon" component={ComingSoon} />,
    <TrackedRoute key={key++} exact path="/equality" ifUser={isStaff} component={Equality} />,
];
