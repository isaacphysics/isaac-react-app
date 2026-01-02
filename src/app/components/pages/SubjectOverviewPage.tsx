import React from "react";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { useUrlPageTheme } from "../../services/pageContext";
import { above, HUMAN_SUBJECTS, isDefined, LEARNING_STAGE, LearningStage, PHY_NAV_SUBJECTS, SEARCH_RESULT_TYPE, Subject, useDeviceSize } from "../../services";
import { PageContextState } from "../../../IsaacAppTypes";
import { convertToALVIGameboard, ListView, ListViewCardProps, ListViewCards } from "../elements/list-groups/ListView";
import { LandingPageFooter } from "./SubjectLandingPage";
import { DifficultyIcon } from "../elements/svg/DifficultyIcons";
import { AbstractListViewItemState } from "../elements/list-groups/AbstractListViewItem";
import { GameboardDTO } from "../../../IsaacApiTypes";
import { PageMetadata } from "../elements/PageMetadata";

const SubjectCards = ({context}: { context: PageContextState }) => {
    const deviceSize = useDeviceSize();

    if (!isDefined(context?.subject)) return null;

    const humanSubject = context?.subject && HUMAN_SUBJECTS[context.subject];

    const cards: (ListViewCardProps | null)[] = [
        {
            title: "11-14",
            subtitle: `Our 11-14 ${humanSubject} resources introduce secondary ${humanSubject} concepts to students and build their numeracy skills through questions and a selection of experiments.`,
            icon: {
                type: "img" as const,
                icon: `/assets/phy/icons/redesign/subject-${context.subject}.svg`,
            },
            url: `/${context.subject}/11_14`,
            stage: LEARNING_STAGE["11_TO_14"],
            subject: context.subject,
        },
        {
            title: "GCSE",
            subtitle: `Our GCSE ${humanSubject} resources develop the ${humanSubject} knowledge needed at GCSE through the use of questions, concepts and books.`,
            icon: {
                type: "img" as const,
                icon: `/assets/phy/icons/redesign/subject-${context.subject}.svg`,
            },
            url: `/${context.subject}/gcse`,
            stage: LEARNING_STAGE.GCSE,
            subject: context.subject,
            state: context.subject === "biology" ? AbstractListViewItemState.COMING_SOON : undefined,
        },
        {
            title: "A Level",
            subtitle: `Our A Level ${humanSubject} resources further strengthen the understanding of ${humanSubject}, while developing problem solving skills. Our resources include questions, concepts and books.`,
            icon: {
                type: "img" as const,
                icon: `/assets/phy/icons/redesign/subject-${context.subject}.svg`,
            },
            url: `/${context.subject}/a_level`,
            stage: LEARNING_STAGE.A_LEVEL,
            subject: context.subject,
        },
        {
            title: "University",
            subtitle: `Our University ${humanSubject} resources help you prepare for your university STEM degree.`,
            icon: {
                type: "img" as const,
                icon: `/assets/phy/icons/redesign/subject-${context.subject}.svg`,
            },
            url: `/${context.subject}/university`,
            stage: LEARNING_STAGE.UNIVERSITY,
            subject: context.subject,
        },
    ].map(({stage, ...card}) => (PHY_NAV_SUBJECTS[context.subject as Subject] as readonly LearningStage[])?.includes(stage) || card.state === AbstractListViewItemState.COMING_SOON ? card : null);

    return <ListViewCards showBlanks={above["lg"](deviceSize)} cards={cards
        .sort((a, b) => a ? (b ? 0 : -1) : 1) // put nulls at the end
        .filter((x, i, a) => x || (i % 2 === 0 ? a[i + 1] : a[i - 1])) // remove pairs of nulls
    } />;
};

const ExampleQuestions = ({ subject, className }: { subject: Subject, className: string }) => {
    const items: { [key in Subject]: GameboardDTO[] } = {
        maths: [{
            title: "Sample Maths Questions",
            id: "sample_maths_questions",
        }],
        physics: [{
            title: "Sample Physics Questions",
            id: "sample_phy_questions",
        }],
        chemistry: [{
            title: "Sample Chemistry Questions",
            id: "sample_chem_questions",
        }],
        biology: [{
            title: "Sample Biology Questions",
            id: "sample_bio_questions",
        }],
    };

    return items[subject].length > 0 ? <ListView className={className} type="gameboard" items={items[subject].map(convertToALVIGameboard)} /> : null;
};

export const SubjectOverviewPage = () => {
    const pageContext = useUrlPageTheme();

    if (!isDefined(pageContext?.subject)) return <>No subject found.</>;

    const humanSubject = pageContext?.subject && HUMAN_SUBJECTS[pageContext.subject];

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle={humanSubject ?? ""}
            icon={pageContext?.subject ? {
                type: "img", 
                subject: pageContext.subject,
                icon: `/assets/phy/icons/redesign/subject-${pageContext.subject}.svg`
            } : undefined}
        />
        {humanSubject && <div>
            <PageMetadata title={`Introducing Isaac ${humanSubject}`} />
            <p>
                Welcome to Isaac {humanSubject}, part of <a href="/">Isaac Science</a>! 
                The place to learn maths and science by solving problems. 
                Isaac Science also includes {Object.keys(PHY_NAV_SUBJECTS)
                    .filter(x => x !== pageContext.subject)
                    .map(x => <a key={x} href={`/${x}`}>Isaac {HUMAN_SUBJECTS[x]}</a>)
                    .reduce((prev, curr, index, arr) => index === arr.length - 1 ? <>{prev}, and {curr}</> : <>{prev}, {curr}</>)
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

            <SubjectCards context={pageContext}/>

            <p className="mt-3">
                All Isaac Science questions are classed as either &quot;Practice&quot; or &quot;Challenge&quot; – indicated by the symbols below. 
            </p>
            
            <div className="d-flex flex-row w-100 justify-content-center">
                <div className="d-flex flex-column me-3 align-items-center">
                    <DifficultyIcon difficultyCategory="P"/>
                    <span>Practice</span>
                </div>
                <div className="d-flex flex-column align-items-center">
                    <DifficultyIcon difficultyCategory="C"/>
                    <span>Challenge</span>
                </div>
            </div>

            <p className="mt-3">
                Across Isaac {humanSubject},
                <ul>
                    <li>Practice questions are those that require one concept or equation to solve.</li>
                    <li>Challenge questions are those that require one or more concepts, or require more creativity to solve the problem, helping to develop important problem solving skills. </li>
                </ul>
            </p>

            <div className="d-flex justify-content-center mt-4">
                <ExampleQuestions className="w-100 w-md-75" subject={pageContext.subject} />
            </div>

            <LandingPageFooter context={pageContext} />
        </div>}
    </Container>;
};
