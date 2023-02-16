import React from "react";
import {Tabs} from "./Tabs";
import {Button} from "reactstrap";
import {Link} from "react-router-dom";

// FIXME ADA needs a complete rewrite by Ada content team
export const WhySignUpTabs = () => (
    <Tabs tabContentClass="pt-5">
        {{
            Teachers: <>
                <h3 className={"mb-4"}>Benefits for Teachers:</h3>
                <p>
                    Why use Ada?
                </p>
                <ul>
                    <li>Free computer science learning resources, written by specialist teachers</li>
                    <li>Saves time when planning lessons, setting assignments, and marking homework</li>
                    <li>Features interactive coding questions for Python</li>
                    <li>Includes real code examples in Java, VB.net, and C#</li>
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
                <Button tag={Link} to="/teachers" color="secondary">Teacher Account Page</Button>
            </>,
            Students: <>
                <h3 className={"mb-4"}>Benefits for Students:</h3>
                <p>
                    Why use Ada?
                </p>
                <ul>
                    <li>Free computer science resources, written by specialist teachers</li>
                    <li>Designed to support your learning</li>
                    <li>Prepares you for your exams</li>
                    <li>Features interactive coding questions for Python</li>
                    <li>Includes real code examples in Java, VB.net, and C#</li>
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
                <Button tag={Link} to="/register" color="secondary">Sign Up</Button>
            </>
        }}
    </Tabs>
);
