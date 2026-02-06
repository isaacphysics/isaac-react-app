import React, {lazy} from "react";
import {isLoggedIn, isTeacherOrAbove, isTutorOrAbove, PATHS, PHY_NAV_SUBJECTS} from "../../../services";
import {TeacherFeatures} from "../../pages/TeacherFeatures";
import {TutorFeatures} from "../../pages/TutorFeatures";
import {Concepts} from "../../pages/Concepts";
import {SetQuizzes} from "../../pages/quizzes/SetQuizzes";
import {QuizDoAssignment} from "../../pages/quizzes/QuizDoAssignment";
import {QuizAttemptFeedback} from "../../pages/quizzes/QuizAttemptFeedback";
import {QuizTeacherFeedback} from "../../pages/quizzes/QuizTeacherFeedback";
import {QuizPreview} from "../../pages/quizzes/QuizPreview";
import {QuizDoFreeAttempt} from "../../pages/quizzes/QuizDoFreeAttempt";
import {MyQuizzes} from "../../pages/quizzes/MyQuizzes";
import {Events} from "../../pages/Events";
import {AssignmentSchedule} from "../../pages/AssignmentSchedule";
import {TeacherRequest} from "../../pages/TeacherRequest";
import {RegistrationStart} from "../../pages/RegistrationStart";
import {EmailAlterHandler} from "../../handlers/EmailAlterHandler";
import {News} from "../../pages/News";
import {RegistrationAgeCheck} from "../../pages/RegistrationAgeCheck";
import {RegistrationAgeCheckFailed} from "../../pages/RegistrationAgeCheckFailed";
import {RegistrationAgeCheckParentalConsent} from "../../pages/RegistrationAgeCheckParentalConsent";
import {RegistrationSetDetails} from "../../pages/RegistrationSetDetails";
import {RegistrationTeacherConnect} from "../../pages/RegistrationTeacherConnect";
import {RegistrationSuccess} from "../../pages/RegistrationSuccess";
import {RegistrationSetPreferences} from "../../pages/RegistrationSetPreferences";
import {PracticeQuizzes} from "../../pages/quizzes/PracticeQuizzes";
import {SubjectLandingPage} from "../../pages/SubjectLandingPage";
import {QuestionFinder} from "../../pages/QuestionFinder";
import {QuestionDecks} from "../../pages/QuestionDecks";
import {QuickQuizzes} from "../../pages/QuickQuizzes";
import {SubjectOverviewPage} from "../../pages/SubjectOverviewPage";
import {Glossary} from "../../pages/Glossary";
import {Book} from "../../elements/Book";
import {SolvingPhysProblems} from "../../pages/books_old/SolvingPhysProblems";
import {PhysBookYrNine} from "../../pages/books_old/phys_book_yr9";
import {PreUniMaths} from "../../pages/books_old/pre_uni_maths";
import {QuizView} from "../../pages/quizzes/QuizView";
import {BooksOverview} from "../../pages/BooksOverview";
import {RevisionPage} from "../../pages/RevisionDetailPage";
import {AnvilAppsListing} from "../../pages/AnvilAppsListing";
import {AdaCSOverviewPage} from "../../pages/AdaCSOverviewPage";
import { IsaacStats } from "../../pages/IsaacBirthdayStats";
import { Programmes } from "../../pages/Programmes";
import { RequireAuth } from "../../navigation/UserAuthentication";
import { Navigate, Route } from "react-router";
import { Generic } from "../../pages/Generic";
import { BoardIdRedirect } from "./RoutesComponentsPhy";
import { NavigateWithSlug } from "../../navigation/NavigateWithSlug";

const Equality = lazy(() => import('../../pages/Equality'));
const EventDetails = lazy(() => import('../../pages/EventDetails'));
const GraphSketcherPage = lazy(() => import("../../pages/GraphSketcher"));

const subjectStagePairPages : Record<string, React.ComponentType<any>> = {
    // at all valid paths matching `/:subject/:stage${string}`, render the given component
    "": SubjectLandingPage,
    "/questions": QuestionFinder,
    "/concepts": Concepts,
    "/practice_tests": PracticeQuizzes,
    "/quick_quizzes": QuickQuizzes,
    "/question_decks": QuestionDecks,
    "/glossary": Glossary,
    "/tools": AnvilAppsListing,
};

// TODO: remove these (and related imports) when we have replaced old book index pages with API-based ones
const old_books : Record<string, React.ComponentType<any>> = {
    "/books/pre_uni_maths": PreUniMaths,
    "/books/solve_physics_problems": SolvingPhysProblems,
    "/books/phys_book_yr9": PhysBookYrNine,
};

let key = 0;
export const RoutesPhy = [
    // Registration
    <Route key={key++} path="/register" element={<RegistrationStart />} />,
    <Route key={key++} path="/verifyemail" element={<EmailAlterHandler />}/>,
    <Route key={key++} path="/register/student/age" element={<RegistrationAgeCheck />} />,
    <Route key={key++} path="/register/student/additional_info" element={<RegistrationAgeCheckParentalConsent />} />,
    <Route key={key++} path="/register/student/age_denied" element={<RegistrationAgeCheckFailed />} />,
    <Route key={key++} path="/register/student/details" element={<RegistrationSetDetails userRole="STUDENT" />} />,
    <Route key={key++} path="/register/connect" element={<RequireAuth auth={isLoggedIn} element={<RegistrationTeacherConnect />} />} />,
    <Route key={key++} path="/register/preferences" element={<RequireAuth auth={isLoggedIn} element={<RegistrationSetPreferences />} />} />,
    <Route key={key++} path="/register/success" element={<RequireAuth auth={isLoggedIn} element={<RegistrationSuccess />} />} />,

    // Assignments
    <Route key={key++} path="/assignment_schedule" element={<RequireAuth auth={isTutorOrAbove} element={(authUser) => <AssignmentSchedule user={authUser} />} />} />,

    // Teacher test pages
    <Route key={key++} path="/set_tests" element={<RequireAuth auth={isTeacherOrAbove} element={(authUser) => <SetQuizzes user={authUser} />} />} />,
    <Route key={key++} path="/set_quizzes" element={<Navigate to="/set_tests" replace />} />,
    // Student test pages
    <Route key={key++} path="/tests" element={<RequireAuth auth={isLoggedIn} element={(authUser) => <MyQuizzes user={authUser} />} />} />,
    <Route key={key++} path="/quizzes" element={<Navigate to="/tests" replace />} />,
    <Route key={key++} path="/practice_tests" element={<PracticeQuizzes />} />,

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
    // The order of these redirects matters to prevent substring replacement
    <Route key={key++} path="/quiz/assignment/:quizAssignmentId/feedback" element={<NavigateWithSlug to="/test/assignment/:quizAssignmentId/feedback" replace />} />,
    <Route key={key++} path="/quiz/assignment/:quizAssignmentId/page/:page" element={<NavigateWithSlug to="/test/assignment/:quizAssignmentId/page/:page" replace />} />,
    <Route key={key++} path="/quiz/assignment/:quizAssignmentId" element={<NavigateWithSlug to="/test/assignment/:quizAssignmentId" replace />} />,
    <Route key={key++} path="/quiz/attempt/feedback/:quizAssignmentId/:studentId/:page" element={<NavigateWithSlug to="/test/attempt/feedback/:quizAssignmentId/:studentId/:page" replace />} />,
    <Route key={key++} path="/quiz/attempt/feedback/:quizAssignmentId/:studentId" element={<NavigateWithSlug to="/test/attempt/feedback/:quizAssignmentId/:studentId" replace />} />,
    <Route key={key++} path="/quiz/attempt/:quizAttemptId/feedback/:page" element={<NavigateWithSlug to="/test/attempt/:quizAttemptId/feedback/:page" replace />} />,
    <Route key={key++} path="/quiz/attempt/:quizAttemptId/feedback" element={<NavigateWithSlug to="/test/attempt/:quizAttemptId/feedback" replace />} />,
    <Route key={key++} path="/quiz/preview/:quizId/page/:page" element={<NavigateWithSlug to="/test/preview/:quizId/page/:page" replace />} />,
    <Route key={key++} path="/quiz/preview/:quizId" element={<NavigateWithSlug to="/test/preview/:quizId" replace />} />,
    <Route key={key++} path="/quiz/attempt/:quizId/page/:page" element={<NavigateWithSlug to="/test/attempt/:quizId/page/:page" replace />} />,
    <Route key={key++} path="/quiz/attempt/:quizId" element={<NavigateWithSlug to="/test/attempt/:quizId" replace />} />,

    // Books (old)
    ...(Object.entries(old_books).map(([path, Component]) => [
        <Route key={key++} path={path} element={<Component />} />,
        <Route key={key++} path={`${path}/:pageId`} element={<Component />} />,
    ]).flat()),
    <Route key={key++} path="/books/physics_skills_14" element={<Navigate to="/books/physics_skills_19" replace />} />,

    // Books (new)
    <Route key={key++} path={"/books/:bookId"} element={<Book />} />,
    <Route key={key++} path={"/books/:bookId/:pageId"} element={<Book />} />,
    <Route key={key++} path={"/books"} element={<BooksOverview />} />,

    // Revision pages
    // <Route key={key++} path="/revision" element={<SubjectLandingPage />} />,
    <Route key={key++} path="/revision/:pageId" element={<RevisionPage />} />,

    // Subject-stage pages -- see subjectSpecificPages, defined above
    ...(Object.entries(subjectStagePairPages).flatMap(([path, Component]) => (
        Object.entries(PHY_NAV_SUBJECTS).reduce((acc, [subject, stages]) => {
            stages.forEach((stage) => {
                const fullPath = `/${subject}/${stage}${path}`;
                acc.push(<Route key={key++} path={fullPath} element={<Component />} />);
            });
            return acc;
        }, [] as React.ReactElement[])
    ))),
    // Subject overview landing pages
    ...(Object.keys(PHY_NAV_SUBJECTS).map((subject) => (
        <Route key={key++} path={`/${subject}`} element={<SubjectOverviewPage />} />
    ))),
    <Route key={key++} path="/computer_science" element={<AdaCSOverviewPage />} />,

    // Concepts List
    <Route key={key++} path="/concepts" element={<Concepts />} />,

    // Static pages
    <Route key={key++} path="/about" element={<Generic pageIdOverride={"about_us_index"} />} />,
    <Route key={key++} path="/apply_uni" element={<Generic pageIdOverride={"apply_uni"} />} />,
    <Route key={key++} path="/publications" element={<Generic pageIdOverride={"publications"} />} />,
    <Route key={key++} path="/books" element={<Generic pageIdOverride={"books_overview"} />} />,
    <Route key={key++} path="/solving_problems" element={<Generic pageIdOverride={"solving_problems"} />} />,
    <Route key={key++} path="/extraordinary_problems" element={<Generic pageIdOverride={"extraordinary_problems_index"} />} />,
    <Route key={key++} path="/challenge_problems" element={<Generic pageIdOverride={"challenge_problems_index"} />} />,
    <Route key={key++} path="/bios" element={<Generic pageIdOverride={"bios"} />} />,
    <Route key={key++} path="/why_physics" element={<Generic pageIdOverride={"why_physics"} />} />,
    <Route key={key++} path="/fast_track_14" element={<Generic pageIdOverride={"fast_track_14_index"} />} />,
    <Route key={key++} path="/prize_draws" element={<Generic pageIdOverride={"prize_draws"} />} />,
    <Route key={key++} path="/spc" element={<Generic pageIdOverride={"spc"} />} />,
    <Route key={key++} path="/pre_made_gameboards" element={<Generic pageIdOverride={"pre_made_gameboards"} />} />,
    <Route key={key++} path="/chemistry" element={<Generic pageIdOverride={"chemistry_landing_page"} />} />,
    <Route key={key++} path="/survey" element={<Generic pageIdOverride={"survey"} />} />,
    <Route key={key++} path="/book/question" element={<Generic pageIdOverride={"book_question"} />} />,
    <Route key={key++} path="/exam_uni_help" element={<Generic pageIdOverride={"exam_uni_help"} />} />,
    <Route key={key++} path="/coronavirus" element={<Generic pageIdOverride={"2020_03_coronavirus"} />} />,
    <Route key={key++} path="/gameboards/new" element={<Generic pageIdOverride={"question_finder_redirect"} />} />,
    <Route key={key++} path="/teacher_features" element={<TeacherFeatures />}/>,
    <Route key={key++} path="/tutor_features" element={<TutorFeatures />}/>,
    <Route key={key++} path="/sketcher" element={<GraphSketcherPage />} />,
    <Route key={key++} path="/teacher_account_request" element={<RequireAuth auth={isLoggedIn} element={<TeacherRequest />} />} />,
    <Route key={key++} path="/programmes" element={<Programmes />} />,
    <Route key={key++} path="/news" element={<News />} />,
    <Route key={key++} path="/isaac_11" element={<IsaacStats />} />,

    // Legacy Routes
    <Route key={key++} path="/mission" element={<Navigate to="/about" replace />} />,
    <Route key={key++} path="/boards" element={<Navigate to={PATHS.MY_GAMEBOARDS} replace />} />,
    <Route key={key++} path="/my_gameboards" element={<Navigate to={PATHS.MY_GAMEBOARDS} replace />} />,
    <Route key={key++} path="/game_builder" element={<Navigate to={PATHS.GAMEBOARD_BUILDER} replace />} />,
    <Route key={key++} path="/gameboard_builder" element={<Navigate to={PATHS.GAMEBOARD_BUILDER} replace />} />,
    <Route key={key++} path="/add_gameboard/:id" element={<NavigateWithSlug to={`${PATHS.ADD_GAMEBOARD}/:id`} replace />} />,
    <Route key={key++} path="/board/:id" element={<BoardIdRedirect />} />,
    <Route key={key++} path="/gameboards" element={<Navigate to={{pathname: PATHS.GAMEBOARD, hash: window.location.hash}} replace />} />,
    <Route key={key++} path="/gcsebook" element={<Navigate to="/books/phys_book_gcse" replace />} />,
    <Route key={key++} path="/physics_skills_14" element={<Navigate to="/books/physics_skills_19" replace />} />,
    <Route key={key++} path="/book" element={<Navigate to="/books/physics_skills_19" replace />} />,
    <Route key={key++} path="/qmp" element={<Navigate to="/books/quantum_mechanics_primer" replace />} />,
    <Route key={key++} path="/solve_physics_problems" element={<Navigate to="/books/solve_physics_problems" replace />} />,
    <Route key={key++} path="/answers" element={<Navigate to="/support/student/questions#answers" replace />} />,
    <Route key={key++} path="/teachers" element={<Navigate to="/support/teacher/general" replace />} />,
    <Route key={key++} path="/tutors" element={<Navigate to="/support/tutor/general" replace />} />,
    <Route key={key++} path="/pages/isaac_embedded_schools" element={<Navigate to="/support/teacher/partner#embedded_schools" replace />} />,
    <Route key={key++} path="/pages/questions_spreadsheet" element={<Navigate to="/support/teacher/suggestions#spreadsheet" replace />} />,
    <Route key={key++} path="/11_14" element={<Navigate to="/" replace />} />,
    <Route key={key++} path="/gcse" element={<Navigate to="/" replace />} />,
    <Route key={key++} path="/alevel" element={<Navigate to="/" replace />} />,
    <Route key={key++} path="/s/:shortCode" element={<Navigate to="/pages/problem_solving_qs" replace />} />,
    <Route key={key++} path="/pages/boards_by_topic_bio" element={<Navigate to="/biology/a_level/question_decks" replace />} />,
    <Route key={key++} path="/pages/boards_by_topic_chem" element={<Navigate to="/chemistry/a_level/question_decks" replace />} />,
    <Route key={key++} path="/pages/maths_practice" element={<Navigate to="/maths/a_level/question_decks" replace />} />,
    <Route key={key++} path="/pages/pre_made_gameboards" element={<Navigate to="/physics/a_level/question_decks" replace />} />,

    // Isaac Chemistry redirect
    // TODO: if chemistry is a separate site ever, should move to Chemistry routes.
    <Route key={key++} path="/book16" element={<Navigate to="/books/chemistry_16" replace />} />,

    // Teacher Pages
    <Route key={key++} path="/teachermentoring_gcse" element={<RequireAuth auth={isTeacherOrAbove} element={<Generic pageIdOverride={"fragments/teacher_mentoring_gcse_page_frag"} />} />} />,
    <Route key={key++} path="/teachermentoring_alevel" element={<RequireAuth auth={isTeacherOrAbove} element={<Generic pageIdOverride={"fragments/teacher_mentoring_alevel_page_frag"} />} />} />,
    <Route key={key++} path="/teacher_emails" element={<RequireAuth auth={isTeacherOrAbove} element={<Generic pageIdOverride={"fragments/teacher_emails_frag"} />} />} />,

    // Events
    <Route key={key++} path='/events' element={<Events />}/>,
    <Route key={key++} path='/events/:eventId' element={<EventDetails />}/>,
    <Route key={key++} path='/eventbooking/:eventId' element={<RequireAuth auth={isLoggedIn} element={<NavigateWithSlug to="/events/:eventId" replace />} />} />,

    <Route key={key++} path="/equality" element={<Equality />} />,
];
