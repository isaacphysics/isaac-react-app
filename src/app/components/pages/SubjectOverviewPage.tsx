import React from "react";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { useUrlPageTheme } from "../../services/pageContext";
import { above, HUMAN_SUBJECTS, isDefined, LEARNING_STAGE, LearningStage, PHY_NAV_SUBJECTS, Subject, useDeviceSize } from "../../services";
import { PageContextState } from "../../../IsaacAppTypes";
import { convertToALVIGameboard, CustomListViewItemProps, ListView, ListViewCards, transformItemsForCustomListView } from "../elements/list-groups/ListView";
import { LandingPageFooter } from "./SubjectLandingPage";
import { DifficultyIcon } from "../elements/svg/DifficultyIcons";
import { PageMetadata } from "../elements/PageMetadata";
import { useGetGameboardByIdQuery } from "../../state";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { skipToken } from "@reduxjs/toolkit/query";
import { RenderNothing } from "../elements/RenderNothing";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../elements/TransAnchor";

const SubjectCards = ({context}: { context: PageContextState }) => {
    const { t } = useTranslation();
    const deviceSize = useDeviceSize();

    if (!isDefined(context?.subject)) return null;

    const humanSubject = context?.subject && HUMAN_SUBJECTS[context.subject];

    const cards: (CustomListViewItemProps['item'] | null)[] = [
        {
            title: "11–14",
            subtitle: t("common:overview.stage1114.subtitle", { subject: humanSubject, subjectName: humanSubject }),
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
            subtitle: t("common:overview.gcse.subtitle", { subject: humanSubject, subjectName: humanSubject }),
            icon: {
                type: "img" as const,
                icon: `/assets/phy/icons/redesign/subject-${context.subject}.svg`,
            },
            url: `/${context.subject}/gcse`,
            stage: LEARNING_STAGE.GCSE,
            subject: context.subject,
        },
        {
            title: t("common:overview.aLevel.title"),
            subtitle: t("common:overview.aLevel.subtitle", { subject: humanSubject, subjectName: humanSubject }),
            icon: {
                type: "img" as const,
                icon: `/assets/phy/icons/redesign/subject-${context.subject}.svg`,
            },
            url: `/${context.subject}/a_level`,
            stage: LEARNING_STAGE.A_LEVEL,
            subject: context.subject,
        },
        {
            title: t("common:overview.university.title"),
            subtitle: t("common:overview.university.subtitle", { subject: humanSubject }),
            icon: {
                type: "img" as const,
                icon: `/assets/phy/icons/redesign/subject-${context.subject}.svg`,
            },
            url: `/${context.subject}/university`,
            stage: LEARNING_STAGE.UNIVERSITY,
            subject: context.subject,
        },
    ].map(({stage, ...card}) => (PHY_NAV_SUBJECTS[context.subject as Subject] as readonly LearningStage[])?.includes(stage) ? card : null);

    return <ListViewCards
        type="item"
        items={cards
            .filter(above["lg"](deviceSize) ? () => true : (card): card is NonNullable<typeof card> => !!card) // remove nulls on smaller screens
            .sort((a, b) => a ? (b ? 0 : -1) : 1) // put nulls at the end
            .filter((x, i, a) => x || (i % 2 === 0 ? a[i + 1] : a[i - 1])) // remove pairs of nulls
            .map(transformItemsForCustomListView)
        }
    />;
};

const ExampleQuestions = ({ subject, className }: { subject: Subject, className: string }) => {
    const { t } = useTranslation();
    const gameboard_ids: { [key in Subject]: string } = {
        maths: "sample_maths_questions_r2",
        physics: "sample_phy_questions",
        chemistry: "sample_chem_questions",
        biology: "sample_bio_questions"
    };

    const gameboardByIdQuery = useGetGameboardByIdQuery(gameboard_ids[subject] ?? skipToken);

    return <ShowLoadingQuery
        query={gameboardByIdQuery}
        defaultErrorTitle={t("common:overview.exampleQuestions.errorTitle")}
        ifNotFound={RenderNothing}
        uninitializedPlaceholder={RenderNothing}
        maintainOnRefetch
        thenRender={(gameboard) => <ListView className={className} type="gameboard" items={[convertToALVIGameboard(gameboard)]}/>}
    />;
};

export const SubjectOverviewPage = () => {
    const { t } = useTranslation();
    const pageContext = useUrlPageTheme();

    if (!isDefined(pageContext?.subject)) return <>{t("common:overview.notFound")}</>;

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
            <PageMetadata title={t("common:overview.pageTitle", { subject: humanSubject })} />
            <p>
                Welcome to Isaac {humanSubject}, part of <a href="/">Isaac Science</a>! 
                The place to learn maths and science by solving problems. 
                Isaac Science also includes {Object.keys(PHY_NAV_SUBJECTS)
                    .filter(x => x !== pageContext.subject)
                    .map(x => <a key={x} href={`/${x}`}>{t("common:overview.welcome.subjectLink", { subjectName: HUMAN_SUBJECTS[x] })}</a>)
                    .reduce((prev, curr, index, arr) => index === arr.length - 1 ? <>{prev}, and {curr}</> : <>{prev}, {curr}</>)
                }.
                Our resources include questions, tests, concept pages and books.
            </p>
            <p>
                <Trans
                    i18nKey="common:overview.freeAccount"
                    components={{
                        teacherFeaturesLink: <TransAnchor href="/teacher_features" />,
                    }}
                />
            </p>
            <p>
                {t("common:overview.examIndependent", { subject: humanSubject })} 
            </p>

            <SubjectCards context={pageContext}/>

            <p className="mt-3">
                {t("common:overview.difficulty.intro")} 
            </p>
            
            <div className="d-flex flex-row w-100 justify-content-center">
                <div className="d-flex flex-column me-3 align-items-center">
                    <DifficultyIcon difficultyCategory="P"/>
                    <span>{t("common:overview.difficulty.practice")}</span>
                </div>
                <div className="d-flex flex-column align-items-center">
                    <DifficultyIcon difficultyCategory="C"/>
                    <span>{t("common:overview.difficulty.challenge")}</span>
                </div>
            </div>

            <p className="mt-3">
                Across Isaac {humanSubject},
                <ul>
                    <li>{t("common:overview.difficulty.practiceDesc")}</li>
                    <li>{t("common:overview.difficulty.challengeDesc")} </li>
                </ul>
            </p>

            <div className="d-flex justify-content-center mt-4">
                <ExampleQuestions className="w-100 w-md-75" subject={pageContext.subject} />
            </div>

            <LandingPageFooter context={pageContext} />
        </div>}
    </Container>;
};
