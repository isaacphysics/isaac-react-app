import React from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {GameboardFilter} from "../../pages/GameboardFilter";
import {PhysicsSkills19} from "../../pages/books/physics_skills_19";
import {PhysBookGcse} from "../../pages/books/phys_book_gcse";
import {PhysicsSkills14} from "../../pages/books/physics_skills_14";
import {PreUniMaths} from "../../pages/books/pre_uni_maths";
import {Chemistry16} from "../../pages/books/chemistry_16";

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
];
