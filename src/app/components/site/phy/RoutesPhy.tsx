import React from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {GameboardFilter} from "../../pages/GameboardFilter";
import {PhysicsSkills19} from "../../pages/books/physics_skills_19";
import {PhysBookGcse} from "../../pages/books/phys_book_gcse";
import {PhysicsSkills14} from "../../pages/books/physics_skills_14";
import {PreUniMaths} from "../../pages/books/pre_uni_maths";
import {Chemistry16} from "../../pages/books/chemistry_16";
import StaticPageRoute from "../../navigation/StaticPageRoute";
import {Redirect} from "react-router";
import {isTeacher} from "../../../services/user";

let key = 0;
export const RoutesPhy = [
    // Gameboard filter
    <TrackedRoute key={key++} exact path="/gameboards/generate" component={GameboardFilter} />,

    // Books
    <TrackedRoute key={key++} exact path="/books/physics_skills_19" component={PhysicsSkills19}/>,
    <TrackedRoute key={key++} exact path="/books/phys_book_gcse" component={PhysBookGcse}/>,
    <TrackedRoute key={key++} exact path="/books/physics_skills_14" component={PhysicsSkills14}/>,
    <TrackedRoute key={key++} exact path="/books/pre_uni_maths" component={PreUniMaths}/>,
    <TrackedRoute key={key++} exact path="/books/chemistry_16" component={Chemistry16}/>,

    // Static pages
    <StaticPageRoute key={key++} exact path="/glossary" />,
    <StaticPageRoute key={key++} exact path="/apply_uni" />,
    <StaticPageRoute key={key++} exact path="/solving_problems" />,
    <StaticPageRoute key={key++} exact path="/extraordinary_problems" pageId="extraordinary_problems_index" />,
    <StaticPageRoute key={key++} exact path="/challenge_problems" pageId="challenge_problems_index" />,
    <StaticPageRoute key={key++} exact path="/bios" />,
    <StaticPageRoute key={key++} exact path="/why_physics" />,
    <StaticPageRoute key={key++} exact path="/fast_track_14" pageId="fast_track_14_index" />,
    <StaticPageRoute key={key++} exact path="/prize_draws" />,
    <StaticPageRoute key={key++} exact path="/spc" />,
    <StaticPageRoute key={key++} exact path="/chemistry" pageId="chemistry_landing_page" />,
    <StaticPageRoute key={key++} exact path="/survey" />,
    <StaticPageRoute key={key++} exact path="/book/question" pageId="book_question" />,
    <StaticPageRoute key={key++} exact path="/exam_uni_help" />,
    <StaticPageRoute key={key++} exact path="/gcse" />,
    <StaticPageRoute key={key++} exact path="/alevel" />,
    <StaticPageRoute key={key++} exact path="/coronavirus" pageId="2020_03_coronavirus" />,

    // Legacy Routes
    <Redirect key={key++} exact from="/mission" to="/about" />,
    <Redirect key={key++} exact from="/boards" to="/my_gameboards" />,
    <Redirect key={key++} exact from="/board/:id" to="/gameboards#:id" />,

    // Teacher Pages
    <StaticPageRoute key={key++} exact ifUser={isTeacher} path="/teachermentoring_gcse" pageId="fragments/teacher_mentoring_gcse_page_frag" />,
    <StaticPageRoute key={key++} exact ifUser={isTeacher} path="/teachermentoring_alevel" pageId="fragments/teacher_mentoring_alevel_page_frag" />,
];
