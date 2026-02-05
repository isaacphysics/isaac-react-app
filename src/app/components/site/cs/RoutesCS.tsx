import React, {lazy} from "react";
import {AllTopics} from "../../pages/AllTopics";
import {Topic} from "../../pages/Topic";
import {Navigate, Route} from "react-router";
import {EXAM_BOARD, isLoggedIn, isStaff, isTeacherOrAbove, isTutorOrAbove, STAGE} from "../../../services";
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
import { TeacherMentoring } from "../../pages/TeacherMentoring";
import { RequireAuth } from "../../navigation/UserAuthentication";
import { Generic } from "../../pages/Generic";

const Equality = lazy(() => import('../../pages/Equality'));
const EventDetails = lazy(() => import('../../pages/EventDetails'));

let key = 0;
export const RoutesCS = [

    // Registration flow
    <Route key={key++} path="/dashboard" element={<RequireAuth auth={isTeacherOrAbove} element={<Overview />} />} />,
    <Route key={key++} path="/register" element={<RegistrationStart />} />,
    <Route key={key++} path="/register/role" element={<RegistrationRoleSelect />} />,
    <Route key={key++} path="/register/student/age" element={<RegistrationAgeCheck />} />,
    <Route key={key++} path="/register/student/age_denied" element={<RegistrationAgeCheckFailed />} />,
    <Route key={key++} path="/register/student/details" element={<RegistrationSetDetails userRole="STUDENT" />} />,
    <Route key={key++} path="/register/teacher/details" element={<RegistrationSetDetails userRole="TEACHER" />} />,
    <Route key={key++} path="/verifyemail" element={<RegistrationVerifyEmail />} />,
    <Route key={key++} path="/register/connect" element={<RequireAuth auth={isLoggedIn} element={<RegistrationTeacherConnect />} />} />,
    <Route key={key++} path="/register/preferences" element={<RequireAuth auth={isLoggedIn} element={<RegistrationSetPreferences />} />} />,
    <Route key={key++} path="/register/success" element={<RequireAuth auth={isLoggedIn} element={<RegistrationSuccess />} />} />,


    // Student and teacher resources
    <Route key={key++} path="/students" element={<StudentResources />} />,
    <Route key={key++} path="/teachers" element={<TeacherResources />} />,

    // Assignments
    <Route key={key++} path="/assignment_progress" element={<Navigate to="/my_markbook" replace />} />,
    <Route key={key++} path="/assignment_progress/:assignmentId" element={<Navigate to="/my_markbook/:assignmentId" replace />} />,

    // Teacher test pages
    <Route key={key++} path="/set_tests" element={<RequireAuth auth={isTeacherOrAbove} element={(authUser) => <SetQuizzes user={authUser} />} />} />,
    // Student test pages
    <Route key={key++} path="/tests" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <MyQuizzes user={authUser} />} />} />,

    <Route key={key++} path="/practice_tests" element={<RequireAuth auth={isLoggedIn} element={<PracticeQuizzes />} />} />,
    // Quiz (test) pages
    <Route key={key++} path="/test/assignment/:quizAssignmentId" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <QuizDoAssignment user={authUser} />} />} />,
    <Route key={key++} path="/test/assignment/:quizAssignmentId/page/:page" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <QuizDoAssignment user={authUser} />} />} />,
    <Route key={key++} path="/test/attempt/:quizAttemptId/feedback" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <QuizAttemptFeedback user={authUser} />} />} />,
    <Route key={key++} path="/test/attempt/:quizAttemptId/feedback/:page" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <QuizAttemptFeedback user={authUser} />} />} />,
    <Route key={key++} path="/test/attempt/feedback/:quizAssignmentId/:studentId" element={<RequireAuth auth={isTeacherOrAbove} element={(authUser) => <QuizAttemptFeedback user={authUser} />} />} />,
    <Route key={key++} path="/test/attempt/feedback/:quizAssignmentId/:studentId/:page" element={<RequireAuth auth={isTeacherOrAbove} element={(authUser) => <QuizAttemptFeedback user={authUser} />} />} />,
    <Route key={key++} path="/test/assignment/:quizAssignmentId/feedback" element={<RequireAuth auth={isTeacherOrAbove} element={(authUser) => <QuizTeacherFeedback user={authUser} />} />} />,
    // Tutors can preview tests iff the test is student only
    <Route key={key++} path="/test/preview/:quizId" element={<RequireAuth auth={isTutorOrAbove} element={(authUser) => <QuizPreview user={authUser} />} />} />,
    <Route key={key++} path="/test/preview/:quizId/page/:page" element={<RequireAuth auth={isTutorOrAbove} element={(authUser) => <QuizPreview user={authUser} />} />} />,
    <Route key={key++} path="/test/attempt/:quizId" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <QuizDoFreeAttempt user={authUser} />} />} />,
    <Route key={key++} path="/test/attempt/:quizId/page/:page" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <QuizDoFreeAttempt user={authUser} />} />} />,
    <Route key={key++} path="/test/view/:quizId" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <QuizView user={authUser} />} />} />,

    // Topics and content
    <Route key={key++} path="/topics" element={<AllTopics />} />,
    <Route key={key++} path="/topics/projects_link_pseudo_project" element={<Navigate to="/projects" replace />} />,
    <Route key={key++} path="/topics/:topicName" element={<Topic />} />,
    <Route key={key++} path="/exam_specifications_england" element={<ExamSpecifications title="English qualifications" />} />,
    <Route key={key++} path="/exam_specifications_wales" element={<ExamSpecifications examBoardFilter={[EXAM_BOARD.WJEC]} title="Welsh qualifications" />} />,
    <Route key={key++} path="/exam_specifications_ada" element={<ExamSpecifications examBoardFilter={[EXAM_BOARD.ADA]} stageFilter={[STAGE.CORE, STAGE.ADVANCED]} title="Ada CS Curriculum" />} />,
    <Route key={key++} path="/concepts/sqa_computing_science" element={<Navigate to="/exam_specifications_scotland" replace />} />,
    <Route key={key++} path="/exam_specifications_scotland" element={<ExamSpecifications examBoardFilter={[EXAM_BOARD.SQA]} stageFilter={[STAGE.SCOTLAND_NATIONAL_5, STAGE.SCOTLAND_HIGHER, STAGE.SCOTLAND_ADVANCED_HIGHER]} title="Scottish qualifications" />} />,
    <Route key={key++} path="/exam_specifications" element={<ExamSpecificationsDirectory />} />,
    <Route key={key++} path="/teaching_order" element={<TeachingOrders />}/>,

    // Pod pages: news, projects, online courses
    <Route key={key++} path="/news" element={<News />} />,
    <Route key={key++} path="/projects" element={<CSProjects />} />,
    <Route key={key++} path="/pages/online_courses" element={<OnlineCourses />} />,

    // Books: FIXME ADA are we going to include these?
    // <Route key={key++} path="/books/workbook_20_aqa" component={Workbook20AQA}/>,
    // <Route key={key++} path="/books/workbook_20_ocr" component={Workbook20OCR}/>,

    // Events
    <Route key={key++} path='/events' element={<Events />}/>,
    <Route key={key++} path='/events/:eventId' element={<EventDetails />}/>,
    <Route key={key++} path='/eventbooking/:eventId' element={<RequireAuth auth={isLoggedIn} element={<RedirectToEvent />} />} />,

    // Static pages:
    <Route key={key++} path="/about" element={<Generic pageIdOverride={"about_us"} />} />,
    <Route key={key++} path="/safeguarding" element={<Generic pageIdOverride={"events_safeguarding"} />} />,
    <Route key={key++} path="/teacher_account_request" element={<RequireAuth auth={isLoggedIn} element={<TeacherAccountSelfUpgrade />} />} />,

    // <Route key={key++} path="/student_rewards" element={<Generic pageIdOverride={"student_rewards_programme"} />} />,
    // <Route key={key++} path="/teachcomputing" element={<Generic pageIdOverride={"teach_computing"} />} />,

    // <Route key={key++} ifUser={isEventLeaderOrStaff} path="/events_toolkit" element={<Generic pageIdOverride={"fragments/event_leader_event_toolkit_fragment"} />} />,

    // <Route key={key++} path="/coming_soon" element={<ComingSoon />} />,
    <Route key={key++} path="/equality" element={<RequireAuth auth={isStaff} element={<Equality />} />} />,

    <Route key={key++} path={"/student_challenges"} element={<StudentChallenges />} />,
    <Route key={key++} path={"/pages/student_challenges"} element={<Navigate to={"/student_challenges"} replace />} />,

    <Route key={key++} path="/teacher_mentoring" element={<TeacherMentoring />} />,
    <Route key={key++} path={"/pages/teacher_mentoring_2025"} element={<Navigate to={"/teacher_mentoring"} replace />} />,
];
