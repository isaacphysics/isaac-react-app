import React, {lazy} from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {PhysicsSkills19} from "../../pages/books/physics_skills_19";
import {PhysBookGcse} from "../../pages/books/phys_book_gcse";
import {PhysicsSkills14} from "../../pages/books/physics_skills_14";
import {PreUniMaths} from "../../pages/books/pre_uni_maths";
import {Chemistry16} from "../../pages/books/chemistry_16";
import StaticPageRoute from "../../navigation/StaticPageRoute";
import {Redirect} from "react-router";
import {isTeacherOrAbove, isTutorOrAbove} from "../../../services";
import {TeacherFeatures} from "../../pages/TeacherFeatures";
import {TutorFeatures} from "../../pages/TutorFeatures";
import {QuantumMechanicsPrimer} from "../../pages/books/QuantumMechanicsPrimer";
import {SolvingPhysProblems} from "../../pages/books/SolvingPhysProblems";
import {Concepts} from "../../pages/Concepts";
import {AssignmentProgress} from "../../pages/AssignmentProgress";
import {SingleAssignmentProgress} from "../../pages/SingleAssignmentProgress";
import {MathsBookGcse} from "../../pages/books/maths_book_gcse";
import {PhysBookYrNine} from "../../pages/books/phys_book_yr9";
import {StepUpPhys} from "../../pages/books/step_up_phys";
import {LinkingConcepts} from "../../pages/books/linking_concepts";
const GraphSketcherPage = lazy(() => import("../../pages/GraphSketcher"));

let key = 0;
export const RoutesPhy = [
    // Assignments
    <TrackedRoute key={key++} exact path="/assignment_progress" ifUser={isTutorOrAbove} component={AssignmentProgress} />,
    <TrackedRoute key={key++} exact path="/assignment_progress/:assignmentId" ifUser={isTutorOrAbove} component={SingleAssignmentProgress} />,

    // Books
    <TrackedRoute key={key++} exact path="/books/physics_skills_19" component={PhysicsSkills19}/>,
    <TrackedRoute key={key++} exact path="/books/phys_book_gcse" component={PhysBookGcse}/>,
    <TrackedRoute key={key++} exact path="/books/physics_skills_14" component={PhysicsSkills14}/>,
    <TrackedRoute key={key++} exact path="/books/pre_uni_maths" component={PreUniMaths}/>,
    <TrackedRoute key={key++} exact path="/books/chemistry_16" component={Chemistry16}/>,
    <TrackedRoute key={key++} exact path="/books/quantum_mechanics_primer" component={QuantumMechanicsPrimer}/>,
    <TrackedRoute key={key++} exact path="/books/solve_physics_problems" component={SolvingPhysProblems}/>,
    <TrackedRoute key={key++} exact path="/books/maths_book_gcse" component={MathsBookGcse}/>,
    <TrackedRoute key={key++} exact path="/books/phys_book_yr9" component={PhysBookYrNine}/>,
    <TrackedRoute key={key++} exact path="/books/step_up_phys" component={StepUpPhys}/>,
    <TrackedRoute key={key++} exact path="/books/linking_concepts" component={LinkingConcepts}/>,

    // Concepts List
    <TrackedRoute key={key++} exact path="/concepts" component={Concepts} />,

    // Static pages
    <StaticPageRoute key={key++} exact path="/about" pageId="about_us_index" />,
    <StaticPageRoute key={key++} exact path="/glossary" />,
    <StaticPageRoute key={key++} exact path="/apply_uni" />,
    <StaticPageRoute key={key++} exact path="/publications" />,
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

    // Legacy Routes
    <Redirect key={key++} exact from="/mission" to="/about" />,
    <Redirect key={key++} exact from="/boards" to="/my_gameboards" />,
    <Redirect key={key++} exact from="/game_builder" to="/gameboard_builder" />,
    <Redirect key={key++} exact from="/board/:id" to="/gameboards#:id" />,
    <Redirect key={key++} exact from="/gcsebook" to="/books/phys_book_gcse" />,
    <Redirect key={key++} exact from="/physics_skills_14" to="/books/physics_skills_14" />,
    <Redirect key={key++} exact from="/book" to="/books/physics_skills_14" />,
    <Redirect key={key++} exact from="/qmp" to="/books/quantum_mechanics_primer" />,
    <Redirect key={key++} exact from="/solve_physics_problems" to="/books/solve_physics_problems" />,
    <Redirect key={key++} exact from="/answers" to="/support/student/questions#answers" />,
    <Redirect key={key++} exact from="/teachers" to="/support/teacher/general" />,
    <Redirect key={key++} exact from="/pages/isaac_embedded_schools" to="/support/teacher/partner#embedded_schools" />,

    // Isaac Chemistry redirect
    // TODO: if chemistry is a separate site ever, should move to Chemistry routes.
    <Redirect key={key++} exact from="/book16" to="/books/chemistry_16" />,


    // Teacher Pages
    // TUTOR TODO should tutors have access to the syllabi? It could help them structure lessons for their students.
    <StaticPageRoute key={key++} exact ifUser={isTeacherOrAbove} path="/teachermentoring_gcse" pageId="fragments/teacher_mentoring_gcse_page_frag" />,
    <StaticPageRoute key={key++} exact ifUser={isTeacherOrAbove} path="/teachermentoring_alevel" pageId="fragments/teacher_mentoring_alevel_page_frag" />,
];
