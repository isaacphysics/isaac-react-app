import React from "react";
import {Tabs} from "./Tabs";
import {Button} from "reactstrap";
import {Link} from "react-router-dom";
import {isLoggedIn} from "../../services";
import {PotentialUser} from "../../../IsaacAppTypes";
import {Immutable} from "immer";

export const WhySignUpTabs = ({user}: {user: Immutable<PotentialUser> | null}) => (
    <Tabs tabContentClass="pt-5" singleLine>
        {{
            Teachers: <>
                <h2 className={"mb-4"}>Benefits for Teachers:</h2>
                <p>
                    Why use Ada?
                </p>
                <ul>
                    <li>Free computer science learning resources, written by specialist teachers</li>
                    <li>Saves time when planning lessons, and setting and marking work</li>
                    <li>Features interactive coding questions for Python</li>
                    <li>Includes real code examples in Python, C#, VB and Java</li>
                    <li>Tailored to GCSE and A level computer science exam specifications</li>
                    <li>Constantly updated based on research and your feedback</li>
                </ul>
                <p>
                    How it works:
                </p>
                <ul>
                    <li><Link to={"/register"}>Sign up</Link> for an account</li>
                    <li>Browse our topics and questions</li>
                    <li>Set questions for your class</li>
                    <li>Save time while our website does the marking</li>
                    <li>Track your students’ progress and identify new areas to focus on</li>
                </ul>
                <Button tag={Link} to="/teachers" color="primary">Learn about Teacher accounts</Button>
            </>,
            Students: <>
                <h2 className={"mb-4"}>Benefits for Students:</h2>
                <p>
                    Why use Ada?
                </p>
                <ul>
                    <li>Free computer science resources, written by specialist teachers</li>
                    <li>Designed to support your learning</li>
                    <li>Prepares you for your exams</li>
                    <li>Features interactive coding questions for Python</li>
                    <li>Includes real code examples in Python, C#, VB and Java</li>
                    <li>Constantly updated based on research and your feedback</li>
                </ul>
                <p>
                    How it works:
                </p>
                <ul>
                    <li><Link to={"/register"}>Sign up</Link> for an account</li>
                    <li>Learn with high-quality materials</li>
                    <li>Access relevant content suitable to your exam board</li>
                    <li>Monitor your progress as you answer questions</li>
                    <li>Work towards achieving better exam results</li>
                </ul>
                <Button tag={Link} to={isLoggedIn(user) ? "/topics" : "/register"} color="primary">{isLoggedIn(user) ? "Browse topics" : "Get started"}</Button>
            </>
        }}
    </Tabs>
);
