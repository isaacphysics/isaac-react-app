import React, {lazy} from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {AllTopics} from "../../pages/AllTopics";
import StaticPageRoute from "../../navigation/StaticPageRoute";
import {Topic} from "../../pages/Topic";
import {Redirect} from "react-router";
import {EXAM_BOARD, isLoggedIn, isStaff, isTeacherOrAbove, isTutorOrAbove, STAGE} from "../../../services";
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
import {TeachingOrders} from "../../pages/TeachingOrders";
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
import {RedirectToEvent} from "../../navigation/RedirectToEvent";
import { OnlineCourses } from "../../pages/OnlineCourses";
import {ExamSpecificationsDirectory} from "../../pages/ExamSpecificationsDirectory";
import { StudentResources } from "../../pages/StudentResources";
import { TeacherResources } from "../../pages/TeacherResources";
import { CSProjects } from "../../pages/CSProjects";
import { PracticeQuizzes } from "../../pages/quizzes/PracticeQuizzes";
import {StudentChallenges} from "../../pages/StudentChallenges";
import { QuizView } from "../../pages/quizzes/QuizView";
import {Overview} from "../../pages/Overview";

const Equality = lazy(() => import('../../pages/Equality'));
const EventDetails = lazy(() => import('../../pages/EventDetails'));

let key = 0;
export const RoutesCS = [

    // Registration flow
    <TrackedRoute key={key++} exact path="/dashboard" component={Overview} />,
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


    // Student and teacher resources
    <TrackedRoute key={key++} exact path="/students" component={StudentResources} />,
    <TrackedRoute key={key++} exact path="/teachers" component={TeacherResources} />,

    // Assignments
    <Redirect key={key++} from="/assignment_progress" to="/my_markbook" />,
    <TrackedRoute key={key++} exact path="/my_markbook/:assignmentId" ifUser={isTutorOrAbove} component={SingleAssignmentProgress} />,
    <Redirect key={key++} from="/assignment_progress/:assignmentId" to="/my_markbook/:assignmentId" />,

    // Teacher test pages
    <TrackedRoute key={key++} exact path="/set_tests" ifUser={isTeacherOrAbove} component={SetQuizzes} />,
    // Student test pages
    <TrackedRoute key={key++} exact path="/tests" ifUser={isLoggedIn} component={MyQuizzes} />,

    <TrackedRoute key={key++} exact path="/practice_tests" ifUser={isLoggedIn} component={PracticeQuizzes} />,

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
    <TrackedRoute key={key++} exact path="/test/view/:quizId" ifUser={isLoggedIn} component={QuizView} />,
    

    // Topics and content
    <TrackedRoute key={key++} exact path="/topics" component={AllTopics} />,
    <Redirect key={key++} from="/topics/projects_link_pseudo_project" to="/projects" />,
    <TrackedRoute key={key++} exact path="/topics/:topicName" component={Topic} />,
    <TrackedRoute key={key++} exact path="/exam_specifications_england" component={ExamSpecifications}
        componentProps={{title: "English qualifications"}} />,
    <TrackedRoute key={key++} exact path="/exam_specifications_wales" component={ExamSpecifications}
        componentProps={{'examBoardFilter': [EXAM_BOARD.WJEC], title: "Welsh qualifications"}} />,
    <TrackedRoute key={key++} exact path="/exam_specifications_ada" component={ExamSpecifications}
        componentProps={{'examBoardFilter': [EXAM_BOARD.ADA], 'stageFilter': [STAGE.CORE, STAGE.ADVANCED], title: "Ada CS Curriculum"}} />,
    <Redirect key={key++} from="/concepts/sqa_computing_science" to="/exam_specifications_scotland" />,
    <TrackedRoute key={key++} exact path="/exam_specifications_scotland" component={ExamSpecifications}
        componentProps={{'examBoardFilter': [EXAM_BOARD.SQA], 'stageFilter': [STAGE.SCOTLAND_NATIONAL_5,
            STAGE.SCOTLAND_HIGHER, STAGE.SCOTLAND_ADVANCED_HIGHER], title: "Scottish qualifications"}} />,
    <TrackedRoute key={key++} exact path="/exam_specifications" component={ExamSpecificationsDirectory} />,
    <TrackedRoute key={key++} exact path="/teaching_order" component={TeachingOrders}/>,

    // Pod pages: news, projects, online courses
    <TrackedRoute key={key++} exact path="/news" component={News} />,
    <TrackedRoute key={key++} exact path="/projects" component={CSProjects} />,
    <TrackedRoute key={key++} exact path="/pages/online_courses" component={OnlineCourses} />,

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
    <TrackedRoute key={key++} exact path="/teacher_account_request" ifUser={isLoggedIn} component={TeacherAccountSelfUpgrade}/>,

    // <StaticPageRoute key={key++} exact path="/student_rewards" pageId="student_rewards_programme" />,
    // <StaticPageRoute key={key++} exact path="/teachcomputing" pageId="teach_computing" />,

    // <StaticPageRoute key={key++} exact ifUser={isEventLeaderOrStaff} path="/events_toolkit" pageId="fragments/event_leader_event_toolkit_fragment" />,

    // <TrackedRoute key={key++} exact path="/coming_soon" component={ComingSoon} />,
    <TrackedRoute key={key++} exact path="/equality" ifUser={isStaff} component={Equality} />,

    <TrackedRoute key={key++} exact path={"/student_challenges"} component={StudentChallenges} />,
    <Redirect key={key++} from={"/pages/student_challenges"} to={"/student_challenges"} />
];
