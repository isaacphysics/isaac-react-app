import { PageContextState } from "../../../IsaacAppTypes";
import { BookInfo, getHumanContext, interleave, ISAAC_BOOKS, isFullyDefinedContext, isSingleStageContext, PHY_NAV_SUBJECTS, Writeable } from "../../services";
import { ListViewTagProps } from "../elements/list-groups/AbstractListViewItem";
import { ListViewCardProps } from "../elements/list-groups/ListView";

const extendUrl = (context: NonNullable<Required<PageContextState>>, page: string) => {
    return `/${context.subject}/${context.stage}/${page}`;
};

const QuestionFinderCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Question finder",
        subtitle: `Find ${getHumanContext(context)} questions you need by topic and difficulty level.`
    },
    icon: {type: "hex", icon: "page-icon-finder"},
    subject: context.subject,
    linkTags: [{tag: "Find questions", url: extendUrl(context, 'questions')}]
});

const ConceptPageCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Concepts",
        subtitle: `Review the key concepts for ${getHumanContext(context)}.`
    },
    icon: {type: "hex", icon: "page-icon-concept"},
    subject: context.subject,
    linkTags: [{tag: "Explore concepts", url: extendUrl(context, 'concepts')}]
});

const PracticeTestsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Tests",
        subtitle: "Use tests to practise a range of topics. These tests are available for you to freely attempt."
    },
    icon: {type: "hex", icon: "page-icon-tests"},
    subject: context.subject,
    linkTags: [{tag: "Find a test", url: extendUrl(context, 'practice_tests')}]
});

const BoardsByTopicCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Questions by topic",
        subtitle: "Practise specific topics by using our ready-made question decks on specific topics."
    },
    icon: {type: "hex", icon: "page-icon-question-pack"},
    subject: context.subject,
    linkTags: [{tag: "Explore topic question decks", url: extendUrl(context, 'question_decks')}]
});

// TODO: replace the link tags with links to lessons by *field* (see designs)
const LessonsAndRevisionCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Revision",
        subtitle: "Revise with our summary videos, topic tests and question decks."
    },
    icon: {type: "hex", icon: "page-icon-lessons"},
    subject: context.subject,
    linkTags: [{tag: "List of revision areas", url: extendUrl(context, 'lessons')}]
});

const QuickQuizzesCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Core skills practice",
        subtitle: `Practice core skills required for ${getHumanContext(context)}.`
    },
    icon: {type: "hex", icon: "page-icon-quiz"},
    subject: context.subject,
    linkTags: [{tag: "Find a quiz", url: extendUrl(context, 'quick_quizzes')}]
});

const GlossaryCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Glossary",
        subtitle: "Explore our glossary of terms and definitions."
    },
    icon: {type: "hex", icon: "page-icon-finder"},
    subject: context.subject,
    linkTags: [{tag: "View glossary", url: extendUrl(context, 'glossary')}]
});

const ArbitraryPageLinkCard = (title: string, subtitle: string, linkTags: ListViewTagProps[]) => (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title,
        subtitle
    },
    icon: {type: "hex", icon: "page-icon-lessons"},
    subject: context.subject,
    linkTags
});

const AnvilAppsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Practice apps", "Explore dynamically-generated and interactive questions with our practice apps.", [{tag: "View practice apps", url: extendUrl(context, 'apps')}])(context);
};

const SPCCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Senior Physics Challenge", "Take your problem solving skills to the next level in the Senior Physics Challenge, a competition open to all UK resident A Level students.", [{tag: "Find out more", url: extendUrl(context, '/pages/spc')}])(context);
};

const MathsSkillsQuestionsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Maths skills questions", "Explore our maths skills questions.", [{tag: "View maths skills questions", url: extendUrl(context, 'skills_questions')}])(context);
};

const BiologyExtensionQuestionsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Biology extension", "Stretch your understanding of biology with our extension questions that make you think outside the box.", [{tag: "View extension questions", url: "/pages/biology_extension_questions"}])(context);
};

const subjectSpecificCardsMap: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: (LandingPageCard | null)[]}} = {
    "physics": {
        "11_14": [BoardsByTopicCard, null, null],
        "gcse": [BoardsByTopicCard, LessonsAndRevisionCard, QuickQuizzesCard],
        "a_level": [BoardsByTopicCard, LessonsAndRevisionCard, SPCCard],
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

// constructs a map similar to above for relevant books (pulled from isaacBooks).
const subjectSpecificBooksMap: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: BookInfo[]}} = (
    Object.entries(PHY_NAV_SUBJECTS).reduce((acc, [subject, stages]) => {
        acc[subject as keyof typeof PHY_NAV_SUBJECTS] = stages.reduce((stageAcc, stage) => {
            stageAcc[stage] = ISAAC_BOOKS.filter(book => book.subject === subject && book.stages.includes(stage));
            return stageAcc;
        }, {} as {[stage in typeof stages[number]]: BookInfo[]});
        return acc;
    }, {} as Writeable<{[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: BookInfo[]}}>)
);

type LandingPageCard =  ((context: NonNullable<Required<PageContextState>>) => ListViewCardProps);

const applyContext = (context: NonNullable<Required<PageContextState>>, cards: (LandingPageCard | null)[]): (ListViewCardProps | null)[] => {
    return cards.map(card => card ? card(context) : null);
};

export const getLandingPageCardsForContext = (context: PageContextState, stacked?: boolean): (ListViewCardProps | null)[] => {
    if (!isFullyDefinedContext(context)) return [];
    if (!isSingleStageContext(context)) return [];

    const baseCards: LandingPageCard[] = [
        QuestionFinderCard,
        ConceptPageCard,
        PracticeTestsCard
    ];

    const subjectSpecificCards = subjectSpecificCardsMap[context.subject]?.[context.stage[0] as keyof typeof subjectSpecificCardsMap[typeof context.subject]] || [];

    return applyContext(context, stacked ? [...baseCards, ...subjectSpecificCards] : interleave(baseCards, subjectSpecificCards)); // base cards always appear on the left
};

export const getBooksForContext = (context: PageContextState): BookInfo[] => {
    if (!isFullyDefinedContext(context)) return [];
    if (!context?.stage?.length) {
        return ISAAC_BOOKS.filter(book => book.subject === context.subject);
    }
    
    if (!isFullyDefinedContext(context)) return []; // this is implied by the above, but this has a type guard
    if (!isSingleStageContext(context)) return [];
    
    return subjectSpecificBooksMap[context.subject][context.stage[0] as keyof typeof subjectSpecificBooksMap[typeof context.subject]] || [];
};
