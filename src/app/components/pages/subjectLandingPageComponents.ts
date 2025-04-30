import { PageContextState } from "../../../IsaacAppTypes";
import { BookInfo, getHumanContext, interleave, ISAAC_BOOKS, ISAAC_BOOKS_BY_TAG, isFullyDefinedContext, isSingleStageContext, PHY_NAV_SUBJECTS } from "../../services";
import { ListViewTagProps } from "../elements/list-groups/AbstractListViewItem";
import { ListViewCardProps } from "../elements/list-groups/ListView";

export const extendUrl = (context: NonNullable<Required<PageContextState>>, page: string) => {
    return `/${context.subject}/${context.stage}/${page}`;
};

const QuestionFinderCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Question finder",
        subtitle: `Find ${getHumanContext(context)} questions you need by topic and difficulty level.`
    },
    icon: {type: "hex", icon: "icon-finder"},
    subject: context.subject,
    linkTags: [{tag: "Find questions", url: extendUrl(context, 'questions')}]
});

const ConceptPageCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Concepts",
        subtitle: `Review the key concepts for ${getHumanContext(context)}.`
    },
    icon: {type: "hex", icon: "icon-concept"},
    subject: context.subject,
    linkTags: [{tag: "Explore concepts", url: extendUrl(context, 'concepts')}]
});

const PracticeTestsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Tests",
        subtitle: "Use tests to practise a range of topics. These tests are available for you to freely attempt."
    },
    icon: {type: "hex", icon: "icon-tests"},
    subject: context.subject,
    linkTags: [{tag: "Find a test", url: extendUrl(context, 'practice_tests')}]
});

const BoardsByTopicCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Questions by topic",
        subtitle: "Practise specific topics by using our ready-made question decks on specific topics."
    },
    icon: {type: "hex", icon: "icon-question-deck"},
    subject: context.subject,
    linkTags: [{tag: "Explore topic question decks", url: extendUrl(context, 'question_decks')}]
});

// TODO: replace the link tags with links to lessons by *field* (see designs)
const LessonsAndRevisionCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Revision",
        subtitle: "Revise with our summary videos, topic tests and question decks."
    },
    icon: {type: "hex", icon: "icon-revision"},
    subject: context.subject,
    linkTags: [{tag: "List of revision areas", url: extendUrl(context, 'lessons')}]
});

const QuickQuizzesCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Core skills practice",
        subtitle: `Practice core skills required for ${getHumanContext(context)}.`
    },
    icon: {type: "hex", icon: "icon-quiz"},
    subject: context.subject,
    linkTags: [{tag: "Find a quiz", url: extendUrl(context, 'quick_quizzes')}]
});

const GlossaryCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Glossary",
        subtitle: "Explore our glossary of terms and definitions."
    },
    icon: {type: "hex", icon: "icon-tests"},
    subject: context.subject,
    linkTags: [{tag: "View glossary", url: extendUrl(context, 'glossary')}]
});

const BookCard = (book: BookInfo, description: string) => (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: book.title,
        subtitle: description
    },
    icon: {type: "hex", icon: "icon-book"},
    subject: context.subject,
    linkTags: [{tag: book.title, url: book.path}]
});

const StepIntoPhyCard = BookCard(ISAAC_BOOKS_BY_TAG["phys_book_step_into"], "Discover secondary physics ideas and interesting experiments. Aimed at students in years 7 and 8.");
const StepUpPhyCard = BookCard(ISAAC_BOOKS_BY_TAG["phys_book_step_up"], "Build a strong foundation in physics. Aimed at students in year 9.");

const ArbitraryPageLinkCard = (title: string, subtitle: string, linkTags: ListViewTagProps[]) => (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title,
        subtitle
    },
    icon: {type: "hex", icon: "icon-revision"},
    subject: context.subject,
    linkTags
});

const AnvilAppsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Practice apps", "Explore dynamically-generated and interactive questions with our practice apps.", [{tag: "View practice apps", url: extendUrl(context, 'apps')}])(context);
};

/*const SPCCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Senior Physics Challenge", "Take your problem solving skills to the next level in the Senior Physics Challenge, a competition open to all UK resident A Level students.", [{tag: "Find out more", url: '/pages/spc'}])(context);
};*/

const MentoringSchemeCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Mentoring scheme", "Take your problem solving skills to the next level by joining the mentoring scheme.", [{tag: "Find out more", url: '/pages/isaac_mentor'}])(context);
};

const MathsSkillsQuestionsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Maths skills questions", "Explore our maths skills questions.", [{tag: "View maths skills questions", url: extendUrl(context, 'skills_questions')}])(context);
};

const BiologyExtensionQuestionsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Biology extension", "Stretch your understanding of biology with our extension questions that make you think outside the box.", [{tag: "View extension questions", url: "/pages/biology_extension_questions"}])(context);
};

const subjectSpecificCardsMap: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: (LandingPageCard | null)[]}} = {
    "physics": {
        "11_14": [StepUpPhyCard, QuickQuizzesCard, null],
        "gcse": [BoardsByTopicCard, LessonsAndRevisionCard, QuickQuizzesCard],
        "a_level": [BoardsByTopicCard, LessonsAndRevisionCard, MentoringSchemeCard],
        "university": [BoardsByTopicCard, null, null],
    },
    "chemistry": {
        "gcse": [AnvilAppsCard, GlossaryCard, null],
        "a_level": [BoardsByTopicCard, GlossaryCard, AnvilAppsCard],
        "university": [BoardsByTopicCard, null, null],
    },
    "maths": {
        "gcse": [AnvilAppsCard, BoardsByTopicCard, null],
        // "practice maths" is boards by topic for maths – needs renaming
        "a_level": [BoardsByTopicCard, MathsSkillsQuestionsCard, null],
        "university": [BoardsByTopicCard, null, null],
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
        "a_level": ["maths_book_gcse"],
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
            ? [StepIntoPhyCard, ConceptPageCard, QuestionFinderCard]
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
