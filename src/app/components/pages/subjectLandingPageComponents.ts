import { PageContextState } from "../../../IsaacAppTypes";
import { BookInfo, getHumanContext, interleave, ISAAC_BOOKS, ISAAC_BOOKS_BY_TAG, isFullyDefinedContext, isSingleStageContext, PHY_NAV_SUBJECTS } from "../../services";
import { AbstractListViewItemState, ListViewTagProps } from "../elements/list-groups/AbstractListViewItem";
import { CustomListViewItemProps, transformItemsForCustomListView } from "../elements/list-groups/ListView";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

type CardProps = CustomListViewItemProps['item'];

export const extendUrl = (context: NonNullable<Required<PageContextState>>, page: string) => {
    return `/${context.subject}/${context.stage}/${page}`;
};

// Content want a specific override for A-Level maths on this page
const getHumanContextWithFurtherMaths = (pageContext?: PageContextState): string => {
    if (pageContext?.subject === "maths" && pageContext.stage?.includes("a_level")) {
        return i18next.t("common:context.mathsAndFurtherMaths");
    }
    return getHumanContext(pageContext);
};

const QuestionFinderCard = (context: NonNullable<Required<PageContextState>>): CardProps => ({
    title: i18next.t("common:questionFinder.cardTitle"),
    subtitle: i18next.t("common:questionFinder.cardSubtitle", { subjectContext: getHumanContextWithFurtherMaths(context) }),
    icon: {type: "icon", icon: "icon-finder"},
    subject: context.subject,
    linkTags: [{tag: "Find questions", url: extendUrl(context, 'questions')}]
});

const ConceptPageCard = (context: NonNullable<Required<PageContextState>>): CardProps => ({
    title: i18next.t("common:concepts.cardTitle"),
    subtitle: i18next.t("common:concepts.cardSubtitle", { subjectContext: getHumanContextWithFurtherMaths(context) }),
    icon: {type: "icon", icon: "icon-concept"},
    subject: context.subject,
    linkTags: [{tag: "Explore concepts", url: extendUrl(context, 'concepts')}]
});

const PracticeTestsCard = (context: NonNullable<Required<PageContextState>>): CardProps => ({
    title: context.stage.includes("university") ? i18next.t("common:tests.admissions.title") : i18next.t("common:tests.cardTitle"),
    subtitle: `Use tests to ${context.stage.includes("university") ? "prepare for university admissions tests" : "practise a range of topics"}. These tests are available for you to freely attempt.`,
    icon: {type: "icon", icon: "icon-tests"},
    subject: context.subject,
    linkTags: [{tag: "Find a test", url: extendUrl(context, 'view_tests')}]
});

const BoardsByTopicCard = (context: NonNullable<Required<PageContextState>>): CardProps => ({
    title: i18next.t("common:questionDecks.cardTitle"),
    subtitle: context.subject === "chemistry" && context.stage.includes("university")
        ? i18next.t("common:questionDecks.chemUni.subtitle")
        : context.subject === "maths" && context.stage.includes("a_level")
            ? i18next.t("common:questionDecks.mathsALevel.subtitle")
            : i18next.t("common:questionDecks.cardSubtitle"),
    icon: {type: "icon", icon: "icon-question-deck"},
    subject: context.subject,
    linkTags: [{tag: "View topic question decks", url: extendUrl(context, 'question_decks')}],
    state: context.stage.includes("university") ? AbstractListViewItemState.COMING_SOON : undefined,
});

// TODO: replace the link tags with links to lessons by *field* (see designs)
const LessonsAndRevisionCard = (context: NonNullable<Required<PageContextState>>): CardProps => ({
    title: i18next.t("common:revision.cardTitle"),
    subtitle: i18next.t("common:revision.cardSubtitle"),
    icon: {type: "icon", icon: "icon-revision"},
    subject: context.subject,
    linkTags: [{tag: "List of revision areas", url: `/pages/revision_${context.stage[0].replace("_", "")}_${context.subject}`}],
    state: (context.subject.includes("physics") && ["gcse", "a_level"].includes(context.stage[0])) ? undefined : AbstractListViewItemState.COMING_SOON,
});

const GlossaryCard = (context: NonNullable<Required<PageContextState>>): CardProps => ({
    title: i18next.t("common:glossary.cardTitle"),
    subtitle: i18next.t("common:glossary.cardSubtitle", { subjectContext: getHumanContext(context) }),
    icon: {type: "icon", icon: "icon-tests"},
    subject: context.subject,
    linkTags: [{tag: "Browse the glossary", url: extendUrl(context, 'glossary')}]
});

const BookCard = (book: BookInfo, description: string) => (context: NonNullable<Required<PageContextState>>): CardProps => ({
    title: book.title,
    subtitle: description,
    icon: {type: "icon", icon: "icon-book"},
    subject: context.subject,
    linkTags: [{tag: book.title, url: book.path}]
});

const StepIntoPhyCard = BookCard(ISAAC_BOOKS_BY_TAG["phys_book_step_into"], "Discover secondary physics ideas and interesting experiments. Aimed at students in years 7 and 8.");
const StepUpPhyCard = BookCard(ISAAC_BOOKS_BY_TAG["phys_book_step_up"], "Build a strong foundation in physics. Aimed at students in year 9.");

const ArbitraryPageLinkCard = (title: string, subtitle: string, linkTags: ListViewTagProps[], state?: AbstractListViewItemState) => (context: NonNullable<Required<PageContextState>>): CardProps => ({
    title,
    subtitle,
    icon: {type: "icon", icon: "icon-revision"},
    subject: context.subject,
    linkTags,
    state,
});

// Content want these to each have their own specific wordings
const AnvilAppsCard = (context: NonNullable<Required<PageContextState>>): CardProps => {
    const { t } = useTranslation();
    const subjectSpecificAnvilCard: {[subject in keyof typeof PHY_NAV_SUBJECTS]: Partial<{[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: (CardProps)}>} = {
        "physics": {
            "11_14": ArbitraryPageLinkCard(t("common:skillsPractice.cardTitle"), t("common:skillsPractice.physics1114.subtitle"), [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
            "gcse": ArbitraryPageLinkCard(t("common:skillsPractice.cardTitle"), t("common:skillsPractice.physicsGcse.subtitle"), [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
        },
        "maths": {
            // "11_14": ArbitraryPageLinkCard("Core skills practice", `Keep training those maths skills with our algebra tools.`, [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
            "gcse": ArbitraryPageLinkCard(t("common:skillsPractice.cardTitle"), t("common:skillsPractice.mathsGcse.subtitle"), [{tag: `Practise algebra`, url: extendUrl(context, "tools")}])(context),
            "a_level": ArbitraryPageLinkCard(t("common:skillsPractice.cardTitle"), t("common:skillsPractice.mathsALevel.subtitle"), [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
        },
        "chemistry": {
            "gcse": ArbitraryPageLinkCard(t("common:skillsPractice.cardTitle"), t("common:skillsPractice.chemGcse.subtitle"), [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
            "a_level": ArbitraryPageLinkCard(t("common:skillsPractice.cardTitle"), t("common:skillsPractice.chemALevel.subtitle"), [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
            "university": ArbitraryPageLinkCard(t("common:skillsPractice.chemUni.title"), t("common:skillsPractice.chemUni.subtitle"), [{tag: `Refine your chemistry skills`, url: extendUrl(context, "tools")}], AbstractListViewItemState.COMING_SOON)(context),
        },
        "biology": {
            "gcse": ArbitraryPageLinkCard(t("common:skillsPractice.cardTitle"), t("common:skillsPractice.bioGcse.subtitle"), [{tag: `Practise mental maths`, url: extendUrl(context, "tools")}])(context),
        },
    };

    return subjectSpecificAnvilCard[context.subject][context.stage[0] as keyof typeof subjectSpecificAnvilCard[typeof context.subject]] || ArbitraryPageLinkCard(t("common:skillsPractice.cardTitle"), t("common:skillsPractice.fallback.subtitle", { subject: context.subject }), [{tag: `Refine your ${context.subject} skills`, url: extendUrl(context, "tools")}])(context);
};

/*const SPCCard = (context: NonNullable<Required<PageContextState>>): CardProps => {
    return ArbitraryPageLinkCard("Senior Physics Challenge", "Take your problem solving skills to the next level in the Senior Physics Challenge, a competition open to all UK resident A Level students.", [{tag: "Find out more", url: '/pages/spc'}])(context);
};*/

/*const MentoringSchemeCard = (context: NonNullable<Required<PageContextState>>): CardProps => {
    return ArbitraryPageLinkCard("Mentoring scheme", "Take your problem solving skills to the next level by joining the mentoring scheme.", [{tag: "Find out more", url: "/pages/isaac_mentor"}])(context);
};*/

const ProgrammesCard = (context: NonNullable<Required<PageContextState>>): CardProps => {
    const { t } = useTranslation();
    return ArbitraryPageLinkCard("Programmes", t("common:programmes.cardSubtitle"),
        [{tag: "Mentoring", url: "/pages/mentoring"}, {tag: "SPC", url: "/pages/spc"}, {tag: "STEM SMART", url: "/pages/stem_smart"}])(context);
};

const ExperimentsCard = (context: NonNullable<Required<PageContextState>>): CardProps => {
    const { t } = useTranslation();
    return ArbitraryPageLinkCard("Experiments", t("common:experiments.cardSubtitle"), [{tag: "Explore experiments", url: "/books/step_into_phys/exp_falling"}])(context);
};

const MathsRevisionCard = (context: NonNullable<Required<PageContextState>>): CardProps => {
    const { t } = useTranslation();
    return ArbitraryPageLinkCard("Revision", t("common:revision.mathsALevel.subtitle"), [{tag: "List of revision decks", url: "/pages/revision_maths_alevel"}])(context);
};

const BiologyExtensionQuestionsCard = (context: NonNullable<Required<PageContextState>>): CardProps => {
    const { t } = useTranslation();
    return ArbitraryPageLinkCard(t("common:biologyExtension.cardTitle"), t("common:biologyExtension.cardSubtitle"), [{tag: "View extension questions", url: "/pages/biology_extension_questions"}])(context);
};

const MathsUniCard = (context: NonNullable<Required<PageContextState>>): CardProps => {
    const { t } = useTranslation();
    return ArbitraryPageLinkCard(context.subject === "maths" ? "Revision" : t("common:mathsUni.cardTitle", { subject: context.subject }), t("common:mathsUni.cardSubtitle", { subject: context.subject }), [{tag: "List of revision areas", url: extendUrl(context, "")}], AbstractListViewItemState.COMING_SOON)(context);
};

const subjectSpecificCardsMap: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: (LandingPageCard | null)[]}} = {
    "physics": {
        "11_14": [QuestionFinderCard, ConceptPageCard, AnvilAppsCard],
        "gcse": [BoardsByTopicCard, LessonsAndRevisionCard, AnvilAppsCard],
        "a_level": [BoardsByTopicCard, LessonsAndRevisionCard, ProgrammesCard],
        "university": [BoardsByTopicCard, MathsUniCard, null],
    },
    "chemistry": {
        "gcse": [AnvilAppsCard, GlossaryCard],
        "a_level": [BoardsByTopicCard, GlossaryCard, AnvilAppsCard],
        "university": [BoardsByTopicCard, AnvilAppsCard, MathsUniCard],
    },
    "maths": {
        "gcse": [BoardsByTopicCard, AnvilAppsCard],
        "a_level": [BoardsByTopicCard, MathsRevisionCard, AnvilAppsCard],
        "university": [BoardsByTopicCard, MathsUniCard, null],
    },
    "biology": {
        "gcse": [BoardsByTopicCard, AnvilAppsCard],
        "a_level": [BoardsByTopicCard, GlossaryCard, BiologyExtensionQuestionsCard],
    }
};

const subjectSpecificBooksMap: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: (keyof typeof ISAAC_BOOKS_BY_TAG)[]}} = {
    "physics": {
        "11_14": ["phys_book_step_into", "phys_book_step_up"],
        "gcse": ["phys_book_gcse", "maths_book_gcse", "phys_book_step_up"],
        "a_level": ["physics_skills_19", "maths_book_2e", "physics_linking_concepts", "solving_physics_problems"],
        "university": ["qmp", "physics_linking_concepts", "maths_book_2e", "solving_physics_problems"],
    },
    "maths": {
        "gcse": ["maths_book_gcse"],
        "a_level": ["maths_book_2e", "maths_book_gcse"],
        "university": ["maths_book_2e", "qmp"],
    },
    "chemistry": {
        "gcse": ["maths_book_gcse"],
        "a_level": ["chemistry_16", "maths_book_2e", "maths_book_gcse"],
        "university": ["maths_book_2e"],
    },
    "biology": {
        "gcse": ["maths_book_gcse"],
        "a_level": ["maths_book_2e", "maths_book_gcse"],
    }
};

type LandingPageCard =  ((context: NonNullable<Required<PageContextState>>) => CardProps);

const applyContext = (context: NonNullable<Required<PageContextState>>, cards: (LandingPageCard | null)[]): (CardProps | null)[] => {
    return cards.map(card => card ? card(context) : null);
};

export const getLandingPageCardsForContext = (context: PageContextState, stacked?: boolean, showBlanks?: boolean): CustomListViewItemProps['item'][] => {
    if (!isFullyDefinedContext(context)) return [];
    if (!isSingleStageContext(context)) return [];

    const baseCards: LandingPageCard[] =
        context.stage.includes("11_14") && context.subject === "physics"
            ? [StepIntoPhyCard, StepUpPhyCard, ExperimentsCard]
            : context.stage.includes("gcse") && ["chemistry", "maths"].includes(context.subject)
                ? [QuestionFinderCard, ConceptPageCard]
                : context.stage.includes("gcse") && context.subject === "biology"
                    ? [QuestionFinderCard, GlossaryCard]
                    : [QuestionFinderCard, ConceptPageCard, PracticeTestsCard];

    const subjectSpecificCards = subjectSpecificCardsMap[context.subject]?.[context.stage[0] as keyof typeof subjectSpecificCardsMap[typeof context.subject]] || [];

    return applyContext(
        context, stacked ? [...baseCards, ...subjectSpecificCards] : interleave(baseCards, subjectSpecificCards) // base cards always appear on the left
    ).filter(showBlanks ? () => true : (card): card is NonNullable<typeof card> => !!card).map(transformItemsForCustomListView);
};

export const getBooksForContext = (context: PageContextState): BookInfo[] => {
    if (!isFullyDefinedContext(context)) return [];

    if (!context?.stage?.length) {
        return ISAAC_BOOKS.filter(b => !b.hidden).filter(book => book.subject === context.subject);
    }

    if (!isSingleStageContext(context)) return [];

    return (subjectSpecificBooksMap[context.subject][context.stage[0] as keyof typeof subjectSpecificBooksMap[typeof context.subject]] || []).map(tag => ISAAC_BOOKS_BY_TAG[tag]);
};
