import React, {lazy} from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import StaticPageRoute from "../../navigation/StaticPageRoute";
import {Redirect, RouteComponentProps} from "react-router";
import {isLoggedIn, isTeacherOrAbove, isTutorOrAbove, PATHS, PHY_NAV_SUBJECTS} from "../../../services";
import {TeacherFeatures} from "../../pages/TeacherFeatures";
import {TutorFeatures} from "../../pages/TutorFeatures";
import {Concepts} from "../../pages/Concepts";
import {SingleAssignmentProgress} from "../../pages/SingleAssignmentProgress";
import {SetQuizzes} from "../../pages/quizzes/SetQuizzes";
import {QuizDoAssignment} from "../../pages/quizzes/QuizDoAssignment";
import {QuizAttemptFeedback} from "../../pages/quizzes/QuizAttemptFeedback";
import {QuizTeacherFeedback} from "../../pages/quizzes/QuizTeacherFeedback";
import {QuizPreview} from "../../pages/quizzes/QuizPreview";
import {QuizDoFreeAttempt} from "../../pages/quizzes/QuizDoFreeAttempt";
import {MyQuizzes} from "../../pages/quizzes/MyQuizzes";
import {Events} from "../../pages/Events";
import {RedirectToEvent} from "../../navigation/RedirectToEvent";
import {AssignmentSchedule} from "../../pages/AssignmentSchedule";
import {TeacherRequest} from "../../pages/TeacherRequest";
import { RegistrationStart } from "../../pages/RegistrationStart";
import {EmailAlterHandler} from "../../handlers/EmailAlterHandler";
import {News} from "../../pages/News";
import { RegistrationAgeCheck } from "../../pages/RegistrationAgeCheck";
import { RegistrationAgeCheckFailed } from "../../pages/RegistrationAgeCheckFailed";
import { RegistrationAgeCheckParentalConsent } from "../../pages/RegistrationAgeCheckParentalConsent";
import { RegistrationSetDetails } from "../../pages/RegistrationSetDetails";
import { RegistrationTeacherConnect } from "../../pages/RegistrationTeacherConnect";
import { RegistrationSuccess } from "../../pages/RegistrationSuccess";
import { RegistrationSetPreferences } from "../../pages/RegistrationSetPreferences";
import { RegistrationGroupInvite } from "../../pages/RegistrationGroupInvite";
import { PracticeQuizzes } from "../../pages/quizzes/PracticeQuizzes";
import { SubjectLandingPage } from "../../pages/SubjectLandingPage";
import { QuestionFinder } from "../../pages/QuestionFinder";
import { QuestionDecks } from "../../pages/QuestionDecks";
import { QuickQuizzes } from "../../pages/QuickQuizzes";
import { SubjectOverviewPage } from "../../pages/SubjectOverviewPage";
import { Glossary } from "../../pages/Glossary";
import { Book } from "../../elements/Book";
import { SolvingPhysProblems } from "../../pages/books_old/SolvingPhysProblems";
import { PhysBookYrNine } from "../../pages/books_old/phys_book_yr9";
import { PreUniMaths } from "../../pages/books_old/pre_uni_maths";
import { QuizView } from "../../pages/quizzes/QuizView";
import { BooksOverview } from "../../pages/BooksOverview";
import { RevisionPage } from "../../pages/RevisionDetailPage";
import { AnvilAppsListing } from "../../pages/AnvilAppsListing";
import {AdaCSOverviewPage} from "../../pages/AdaCSOverviewPage";

const Equality = lazy(() => import('../../pages/Equality'));
const EventDetails = lazy(() => import('../../pages/EventDetails'));
const GraphSketcherPage = lazy(() => import("../../pages/GraphSketcher"));

const subjectStagePairPages : Record<string, React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any> | undefined> = {
    // at all valid paths matching `/:subject/:stage${string}`, render the given component
    "": SubjectLandingPage,
    "/questions": QuestionFinder,
    "/concepts": Concepts,
    "/practice_tests": PracticeQuizzes,
    "/quick_quizzes": QuickQuizzes,
    "/question_decks": QuestionDecks,
    "/glossary": Glossary,
    "/apps": AnvilAppsListing,
};

// TODO: remove these (and related imports) when we have replaced old book index pages with API-based ones
const old_books : Record<string, React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any> | undefined> = {
    "/books/pre_uni_maths": PreUniMaths,
    "/books/solve_physics_problems": SolvingPhysProblems,
    "/books/phys_book_yr9": PhysBookYrNine,
};

let key = 0;
export const RoutesPhy = [
    // Registration
    <TrackedRoute key={key++} exact path="/register" component={RegistrationStart} />,
    <TrackedRoute key={key++} exact path="/verifyemail" component={EmailAlterHandler}/>,
    <TrackedRoute key={key++} exact path="/register/student/age" component={RegistrationAgeCheck} />,
    <TrackedRoute key={key++} exact path="/register/student/additional_info" component={RegistrationAgeCheckParentalConsent} />,
    <TrackedRoute key={key++} exact path="/register/student/age_denied" component={RegistrationAgeCheckFailed} />,
    <TrackedRoute key={key++} exact path="/register/student/details" component={RegistrationSetDetails} componentProps={{'role': 'STUDENT'}} />,
    <TrackedRoute key={key++} exact path="/register/group_invitation" component={RegistrationGroupInvite} />,
    <TrackedRoute key={key++} exact path="/register/connect" ifUser={isLoggedIn} component={RegistrationTeacherConnect} />,
    <TrackedRoute key={key++} exact path="/register/preferences" ifUser={isLoggedIn} component={RegistrationSetPreferences} />,
    <TrackedRoute key={key++} exact path="/register/success" ifUser={isLoggedIn} component={RegistrationSuccess} />,

    // Assignments
    <TrackedRoute key={key++} exact path="/assignment_progress/:assignmentId" ifUser={isTutorOrAbove} component={SingleAssignmentProgress} />,
    <TrackedRoute key={key++} exact path="/assignment_schedule" ifUser={isTutorOrAbove} component={AssignmentSchedule} />, // Currently in beta, not yet advertised or listed on navigation menus

    // Teacher test pages
    <TrackedRoute key={key++} exact path="/set_tests" ifUser={isTeacherOrAbove} component={SetQuizzes} />,
    <Redirect key={key++} from="/set_quizzes" to="/set_tests" />,
    // Student test pages
    <TrackedRoute key={key++} exact path="/tests" ifUser={isLoggedIn} component={MyQuizzes} />,
    <Redirect key={key++} from="/quizzes" to="/tests" />,
    <TrackedRoute key={key++} exact path="/practice_tests" component={PracticeQuizzes} />,

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

    // The order of these redirects matters to prevent substring replacement
    <Redirect key={key++} from="/quiz/assignment/:quizAssignmentId/feedback"   to="/test/assignment/:quizAssignmentId/feedback" />,
    <Redirect key={key++} from="/quiz/assignment/:quizAssignmentId/page/:page" to="/test/assignment/:quizAssignmentId/page/:page" />,
    <Redirect key={key++} from="/quiz/assignment/:quizAssignmentId"            to="/test/assignment/:quizAssignmentId" />,
    <Redirect key={key++} from="/quiz/attempt/feedback/:quizAssignmentId/:studentId/:page" to="/test/attempt/feedback/:quizAssignmentId/:studentId/:page" />,
    <Redirect key={key++} from="/quiz/attempt/feedback/:quizAssignmentId/:studentId" to="/test/attempt/feedback/:quizAssignmentId/:studentId" />,
    <Redirect key={key++} from="/quiz/attempt/:quizAttemptId/feedback/:page"   to="/test/attempt/:quizAttemptId/feedback/:page" />,
    <Redirect key={key++} from="/quiz/attempt/:quizAttemptId/feedback"         to="/test/attempt/:quizAttemptId/feedback" />,
    <Redirect key={key++} from="/quiz/preview/:quizId/page/:page"              to="/test/preview/:quizId/page/:page" />,
    <Redirect key={key++} from="/quiz/preview/:quizId"                         to="/test/preview/:quizId" />,
    <Redirect key={key++} from="/quiz/attempt/:quizId/page/:page"              to="/test/attempt/:quizId/page/:page" />,
    <Redirect key={key++} from="/quiz/attempt/:quizId"                         to="/test/attempt/:quizId" />,

    // Books (old)
    ...(Object.entries(old_books).map(([path, component]) => [
        <TrackedRoute key={key++} exact path={path} component={component} />,
        <TrackedRoute key={key++} exact path={`${path}/:pageId`} component={component} />,
    ]).flat()),

    // Books (new)
    <TrackedRoute key={key++} exact path={"/books/:bookId"} component={Book} />,
    <TrackedRoute key={key++} exact path={"/books/:bookId/:pageId"} component={Book} />,
    <TrackedRoute key={key++} exact path={"/books"} component={BooksOverview} />,

    // Revision pages
    // <TrackedRoute key={key++} exact path="/revision" component={SubjectLandingPage} />,
    <TrackedRoute key={key++} exact path="/revision/:pageId" component={RevisionPage} />,

    // Subject-stage pages -- see subjectSpecificPages, defined above
    ...(Object.entries(subjectStagePairPages).map(([path, component]) => (
        <TrackedRoute key={key++} exact path={Object.entries(PHY_NAV_SUBJECTS).reduce((acc, [subject, stages]) => {
            stages.forEach((stage) => {
                acc.push(`/${subject}/${stage}${path}`);
            });
            return acc;
        }, [] as string[])} component={component} />
    ))),

    // Subject overview landing pages
    ...(Object.keys(PHY_NAV_SUBJECTS).map((subject) => (
        <TrackedRoute key={key++} exact path={`/${subject}`} component={SubjectOverviewPage} />
    ))),
    <TrackedRoute key={key++} exact path="/computerscience" component={AdaCSOverviewPage} />,

    // Concepts List
    <TrackedRoute key={key++} exact path="/concepts" component={Concepts} />,

    // Static pages
    <StaticPageRoute key={key++} exact path="/about" pageId="about_us_index" />,
    <StaticPageRoute key={key++} exact path="/apply_uni" />,
    <StaticPageRoute key={key++} exact path="/publications" />,
    <StaticPageRoute key={key++} exact path="/books" pageId="books_overview" />,
    <StaticPageRoute key={key++} exact path="/solving_problems" />,
    <StaticPageRoute key={key++} exact path="/extraordinary_problems" pageId="extraordinary_problems_index" />,
    <StaticPageRoute key={key++} exact path="/challenge_problems" pageId="challenge_problems_index" />,
    <StaticPageRoute key={key++} exact path="/bios" />,
    <StaticPageRoute key={key++} exact path="/why_physics" />,
    <StaticPageRoute key={key++} exact path="/fast_track_14" pageId="fast_track_14_index" />,
    <StaticPageRoute key={key++} exact path="/prize_draws" />,
    <StaticPageRoute key={key++} exact path="/spc" />,
    <StaticPageRoute key={key++} exact path="/pre_made_gameboards" />,
    <StaticPageRoute key={key++} exact path="/chemistry" pageId="chemistry_landing_page" />,
    <StaticPageRoute key={key++} exact path="/survey" />,
    <StaticPageRoute key={key++} exact path="/book/question" pageId="book_question" />,
    <StaticPageRoute key={key++} exact path="/exam_uni_help" />,
    <StaticPageRoute key={key++} exact path="/coronavirus" pageId="2020_03_coronavirus" />,
    <StaticPageRoute key={key++} exact path="/11_14" pageId="11_14" />,
    <StaticPageRoute key={key++} exact path="/gcse" pageId="gcse" />,
    <StaticPageRoute key={key++} exact path="/alevel" pageId="alevel" />,
    <TrackedRoute key={key++} exact path="/teacher_features" component={TeacherFeatures}/>,
    <TrackedRoute key={key++} exact path="/tutor_features" component={TutorFeatures}/>,
    <TrackedRoute key={key++} exact path="/sketcher" component={GraphSketcherPage} />,
    <TrackedRoute key={key++} exact path="/teacher_account_request" ifUser={isLoggedIn} component={TeacherRequest}/>,
    <TrackedRoute key={key++} exact path="/news" component={News} />,

    // Legacy Routes
    <Redirect key={key++} exact from="/mission" to="/about" />,
    <Redirect key={key++} exact from="/boards" to={PATHS.MY_GAMEBOARDS} />,
    <Redirect key={key++} exact from="/my_gameboards" to={PATHS.MY_GAMEBOARDS} />,
    <Redirect key={key++} exact from="/game_builder" to={PATHS.GAMEBOARD_BUILDER} />,
    <Redirect key={key++} exact from="/gameboard_builder" to={PATHS.GAMEBOARD_BUILDER} />,
    <Redirect key={key++} exact from="/add_gameboard/:id" to={`${PATHS.ADD_GAMEBOARD}/:id`} />,
    <Redirect key={key++} exact from="/board/:id" to={`${PATHS.GAMEBOARD}#:id`} />,
    <Redirect key={key++} exact from="/gameboards" to={{pathname: PATHS.GAMEBOARD, hash: window.location.hash}} />,
    <Redirect key={key++} exact from="/gcsebook" to="/books/phys_book_gcse" />,
    <Redirect key={key++} exact from="/physics_skills_14" to="/books/physics_skills_14" />,
    <Redirect key={key++} exact from="/book" to="/books/physics_skills_14" />,
    <Redirect key={key++} exact from="/qmp" to="/books/quantum_mechanics_primer" />,
    <Redirect key={key++} exact from="/solve_physics_problems" to="/books/solve_physics_problems" />,
    <Redirect key={key++} exact from="/answers" to="/support/student/questions#answers" />,
    <Redirect key={key++} exact from="/teachers" to="/support/teacher/general" />,
    <Redirect key={key++} exact from="/tutors" to="/support/tutor/general" />,
    <Redirect key={key++} exact from="/pages/isaac_embedded_schools" to="/support/teacher/partner#embedded_schools" />,
    <Redirect key={key++} exact from="/pages/questions_spreadsheet" to="/support/teacher/suggestions#spreadsheet" />,

    // Isaac Chemistry redirect
    // TODO: if chemistry is a separate site ever, should move to Chemistry routes.
    <Redirect key={key++} exact from="/book16" to="/books/chemistry_16" />,

    // Teacher Pages
    <StaticPageRoute key={key++} exact ifUser={isTutorOrAbove} path="/teachermentoring_gcse" pageId="fragments/teacher_mentoring_gcse_page_frag" />,
    <StaticPageRoute key={key++} exact ifUser={isTutorOrAbove} path="/teachermentoring_alevel" pageId="fragments/teacher_mentoring_alevel_page_frag" />,
    <StaticPageRoute key={key++} exact ifUser={isTutorOrAbove} path="/teacher_emails" pageId="fragments/teacher_emails_frag"/>,

    // Events
    <TrackedRoute key={key++} exact path='/events' component={Events}/>,
    <TrackedRoute key={key++} exact path='/events/:eventId' component={EventDetails}/>,
    <TrackedRoute key={key++} exact path='/eventbooking/:eventId' ifUser={isLoggedIn} component={RedirectToEvent} />,

    <TrackedRoute key={key++} exact path="/equality" component={Equality} />,
];
