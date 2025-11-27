import { PageContextState } from "../../../IsaacAppTypes";
import { BookInfo, getHumanContext, interleave, ISAAC_BOOKS, ISAAC_BOOKS_BY_TAG, isFullyDefinedContext, isSingleStageContext, PHY_NAV_SUBJECTS } from "../../services";
import { AbstractListViewItemState, ListViewTagProps } from "../elements/list-groups/AbstractListViewItem";
import { ListViewCardProps } from "../elements/list-groups/ListView";

export const extendUrl = (context: NonNullable<Required<PageContextState>>, page: string) => {
    return `/${context.subject}/${context.stage}/${page}`;
};

const QuestionFinderCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    title: "Question finder",
    subtitle: `Find ${getHumanContext(context)} questions to try by topic and difficulty level.`,
    icon: {type: "icon", icon: "icon-finder"},
    subject: context.subject,
    linkTags: [{tag: "Find questions", url: extendUrl(context, 'questions')}]
});

const ConceptPageCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    title: "Concepts",
    subtitle: `Review the key concepts for ${getHumanContext(context)}.`,
    icon: {type: "icon", icon: "icon-concept"},
    subject: context.subject,
    linkTags: [{tag: "Explore concepts", url: extendUrl(context, 'concepts')}]
});

const PracticeTestsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    title: context.stage.includes("university") ? "Practice admissions tests" : "Tests",
    subtitle: `Use tests to ${context.stage.includes("university") ? "prepare for university admissions tests" : "practise a range of topics"}. These tests are available for you to freely attempt.`,
    icon: {type: "icon", icon: "icon-tests"},
    subject: context.subject,
    linkTags: [{tag: "Find a test", url: extendUrl(context, 'practice_tests')}]
});

const BoardsByTopicCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    title: "Question decks by topic",
    subtitle: context.subject === "chemistry" && context.stage.includes("university")
        ? "Consolidate your chemistry understanding with these questions by topic."
        : "Practise specific topics by using our ready-made question decks.",
    icon: {type: "icon", icon: "icon-question-deck"},
    subject: context.subject,
    linkTags: [{tag: "View topic question decks", url: extendUrl(context, 'question_decks')}],
    state: context.stage.includes("university") ? AbstractListViewItemState.COMING_SOON : undefined,
});

// TODO: replace the link tags with links to lessons by *field* (see designs)
const LessonsAndRevisionCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    title: "Revision",
    subtitle: "Revise with our summary videos, topic tests and question decks.",
    icon: {type: "icon", icon: "icon-revision"},
    subject: context.subject,
    linkTags: [{tag: "List of revision areas", url: `/pages/revision_${context.stage[0].replace("_", "")}_${context.subject}`}],
    state: (context.subject.includes("physics") && ["gcse", "a_level"].includes(context.stage[0])) ? undefined : AbstractListViewItemState.COMING_SOON,
});

const GlossaryCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    title: "Glossary",
    subtitle: `Use the glossary to understand the vocabulary you need for ${getHumanContext(context)}.`,
    icon: {type: "icon", icon: "icon-tests"},
    subject: context.subject,
    linkTags: [{tag: "Browse the glossary", url: extendUrl(context, 'glossary')}]
});

const BookCard = (book: BookInfo, description: string) => (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    title: book.title,
    subtitle: description,
    icon: {type: "icon", icon: "icon-book"},
    subject: context.subject,
    linkTags: [{tag: book.title, url: book.path}]
});

const StepIntoPhyCard = BookCard(ISAAC_BOOKS_BY_TAG["phys_book_step_into"], "Discover secondary physics ideas and interesting experiments. Aimed at students in years 7 and 8.");
const StepUpPhyCard = BookCard(ISAAC_BOOKS_BY_TAG["phys_book_step_up"], "Build a strong foundation in physics. Aimed at students in year 9.");

const ArbitraryPageLinkCard = (title: string, subtitle: string, linkTags: ListViewTagProps[], state?: AbstractListViewItemState) => (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    title,
    subtitle,
    icon: {type: "icon", icon: "icon-revision"},
    subject: context.subject,
    linkTags,
    state,
});

// Content want these to each have their own specific wordings
const AnvilAppsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    const subjectSpecificAnvilCard: {[subject in keyof typeof PHY_NAV_SUBJECTS]: Partial<{[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: (ListViewCardProps)}>} = {
        "physics": {
            "11_14": ArbitraryPageLinkCard("Core skills practice", `Keep training those maths skills with our algebra tools.`, [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
            "gcse": ArbitraryPageLinkCard("Core skills practice", `Practise the important equations in GCSE physics with these tools.`, [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
        },
        "maths": {
            // "11_14": ArbitraryPageLinkCard("Core skills practice", `Keep training those maths skills with our algebra tools.`, [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
            "gcse": ArbitraryPageLinkCard("Core skills practice", `Practise those core skills, such as rearranging equations, vital for GCSE maths.`, [{tag: `Practise algebra`, url: extendUrl(context, "tools")}])(context),
            "a_level": ArbitraryPageLinkCard("Core skills practice", `Practise those core skills, such as rearranging equations, vital for A Level maths.`, [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
        },
        "chemistry": {
            "gcse": ArbitraryPageLinkCard("Core skills practice", `Practise core skills required in GCSE chemistry.`, [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
            "a_level": ArbitraryPageLinkCard("Core skills practice", `Practise core skills required in A Level chemistry.`, [{tag: `Practise core skills`, url: extendUrl(context, "tools")}])(context),
            "university": ArbitraryPageLinkCard("Skills practice", `Consolidate your chemistry skills with these tools`, [{tag: `Refine your chemistry skills`, url: extendUrl(context, "tools")}], AbstractListViewItemState.COMING_SOON)(context),
        },
        "biology": {},
    };

    return subjectSpecificAnvilCard[context.subject][context.stage[0] as keyof typeof subjectSpecificAnvilCard[typeof context.subject]] || ArbitraryPageLinkCard("Core skills practice", `Consolidate your ${context.subject} skills with these tools.`, [{tag: `Refine your ${context.subject} skills`, url: extendUrl(context, "tools")}])(context);
};

/*const SPCCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Senior Physics Challenge", "Take your problem solving skills to the next level in the Senior Physics Challenge, a competition open to all UK resident A Level students.", [{tag: "Find out more", url: '/pages/spc'}])(context);
};*/

const MentoringSchemeCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Mentoring scheme", "Take your problem solving skills to the next level by joining the mentoring scheme.", [{tag: "Find out more", url: "/pages/isaac_mentor"}])(context);
};

const ExperimentsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Experiments", "Develop experimental skills with interesting experiments.", [{tag: "Explore experiments", url: "/books/step_into_phys/exp_falling"}])(context);
};

const MathsRevisionCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Revision", "Revise with our tailored revision decks on core pure, further pure, and mechanics.", [{tag: "List of revision decks", url: "/pages/revision_maths_alevel"}])(context);
};

const BiologyExtensionQuestionsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Biology extension", "Stretch your understanding of biology with our extension questions that make you think outside the box.", [{tag: "View extension questions", url: "/pages/biology_extension_questions"}])(context);
};

const MathsUniCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard(context.subject === "maths" ? "Revision" : `Maths revision for ${context.subject}`, `Refresh your maths skills in preparation for ${context.subject} at university.`, [{tag: "List of revision areas", url: extendUrl(context, "")}], AbstractListViewItemState.COMING_SOON)(context);
};

const subjectSpecificCardsMap: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: (LandingPageCard | null)[]}} = {
    "physics": {
        "11_14": [QuestionFinderCard, ConceptPageCard, AnvilAppsCard],
        "gcse": [BoardsByTopicCard, LessonsAndRevisionCard, AnvilAppsCard],
        "a_level": [BoardsByTopicCard, LessonsAndRevisionCard, MentoringSchemeCard],
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
        "a_level": ["maths_book_2e", "maths_book_gcse"]
    }
};

type LandingPageCard =  ((context: NonNullable<Required<PageContextState>>) => ListViewCardProps);

const applyContext = (context: NonNullable<Required<PageContextState>>, cards: (LandingPageCard | null)[]): (ListViewCardProps | null)[] => {
    return cards.map(card => card ? card(context) : null);
};

export const getLandingPageCardsForContext = (context: PageContextState, stacked?: boolean): (ListViewCardProps | null)[] => {
    if (!isFullyDefinedContext(context)) return [];
    if (!isSingleStageContext(context)) return [];

    const baseCards: LandingPageCard[] =
        context.stage.includes("11_14") && context.subject === "physics"
            ? [StepIntoPhyCard, StepUpPhyCard, ExperimentsCard]
            : context.stage.includes("gcse") && (context.subject === "chemistry" || context.subject === "maths")
                ? [QuestionFinderCard, ConceptPageCard]
                : [QuestionFinderCard, ConceptPageCard, PracticeTestsCard];

    const subjectSpecificCards = subjectSpecificCardsMap[context.subject]?.[context.stage[0] as keyof typeof subjectSpecificCardsMap[typeof context.subject]] || [];

    return applyContext(context, stacked ? [...baseCards, ...subjectSpecificCards] : interleave(baseCards, subjectSpecificCards)); // base cards always appear on the left
};

export const getBooksForContext = (context: PageContextState): BookInfo[] => {
    if (!isFullyDefinedContext(context)) return [];

    if (!context?.stage?.length) {
        return ISAAC_BOOKS.filter(b => !b.hidden).filter(book => book.subject === context.subject);
    }

    if (!isSingleStageContext(context)) return [];

    return (subjectSpecificBooksMap[context.subject][context.stage[0] as keyof typeof subjectSpecificBooksMap[typeof context.subject]] || []).map(tag => ISAAC_BOOKS_BY_TAG[tag]);
};
