import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { useUrlPageTheme } from "../../services/pageContext";
import { HUMAN_SUBJECTS, PHY_NAV_SUBJECTS } from "../../services";

export const SubjectLandingPage = withRouter((props: RouteComponentProps) => {
    const pageContext = useUrlPageTheme();

    const humanSubject = pageContext?.subject && HUMAN_SUBJECTS[pageContext?.subject];

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle={humanSubject ?? ""}
            icon={pageContext?.subject ? {
                type: "img", 
                subject: pageContext.subject,
                icon: `/assets/phy/icons/redesign/subject-${pageContext.subject}.svg`
            } : undefined}
        />
        {humanSubject && <div className="mt-5">
            <h4>Introducing Isaac {humanSubject}</h4>
            <p>
                Welcome to Isaac {humanSubject}, part of <a href="/">Isaac Science</a>! 
                The place to learn maths and science by solving problems. 
                Isaac Science also includes {Object.keys(PHY_NAV_SUBJECTS)
                    .filter(x => x !== pageContext.subject)
                    .map(x => <a key={x} href={`/${x}`}>Isaac {HUMAN_SUBJECTS[x]}</a>)
                    .reduce((prev, curr, index, arr) => index === arr.length - 1 ? <>{prev} and {curr}</> : <>{prev}, {curr}</>)
                }.
                Our resources include questions, tests, concept pages and books.
            </p>
            <p>
                You can use our resources for FREE. 
                By creating a free account you will have complete access to all the resources available to students under Isaac
                Science and you can make the most of our platform by tracking your progress. 
                Teachers can request a free teacher account to access <a href="/teacher_features">additional features</a>.
            </p>
            <p>
                Our materials are exam board independent. 
                They are designed to help students develop and apply their understanding of fundamental concepts in {humanSubject}, while developing problem solving skills. 
            </p>

            <SubjectCards/>

            <p>
                All Isaac Science questions are classed as either &quot;Practice&quot; or &quot;Challenge&quot; – indicated by the symbols below. 

                In Isaac {humanSubject},
                <ul>
                    <li>Practice questions are those that require one concept or equation to solve.</li>
                    <li>Challenge questions are those that require one or more concepts, or require more creativity to solve the problem, helping to develop important problem solving skills. </li>
                </ul>
            </p>

            <ExampleQuestions/>

            {/* copy subject landing page books/news/events when merged */}
        </div>}
    </Container>;
});
