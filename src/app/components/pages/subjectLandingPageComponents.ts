import { PageContextState } from "../../../IsaacAppTypes";
import { getHumanContext, interleave, isDefinedContext, isSingleStageContext, PHY_NAV_SUBJECTS, Writeable } from "../../services";
import { ListViewTagProps } from "../elements/list-groups/AbstractListViewItem";
import { ListViewCardProps } from "../elements/list-groups/ListView";
import { BookInfo, isaacBooks } from "../elements/modals/IsaacBooksModal";

const extendUrl = (context: NonNullable<Required<PageContextState>>, page: string) => {
    return `/${context.subject}/${context.stage}/${page}`;
};

const QuestionFinderCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Find more practice questions",
        subtitle: `Our ${getHumanContext(context)} question finder can help you find the practice questions you need by topic, difficulty level and more.`
    },
    icon: {type: "hex", icon: "page-icon-finder"},
    subject: context.subject,
    linkTags: [{tag: "Search questions", url: extendUrl(context, 'questions')}]
});

const ConceptPageCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: `Explore ${getHumanContext(context)} concepts`,
        subtitle: `Refresh your memory on the key concepts for ${getHumanContext(context)}.`
    },
    icon: {type: "hex", icon: "page-icon-concept"},
    subject: context.subject,
    linkTags: [{tag: "Explore concepts", url: extendUrl(context, 'concepts')}]
});

const PracticeTestsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Try our practice tests",
        subtitle: "Explore practice tests that are available for you to attempt independently. Test questions cannot be found elsewhere on the platform and once a test is submitted you cannot change your answers."
    },
    icon: {type: "hex", icon: "page-icon-tests"},
    subject: context.subject,
    linkTags: [{tag: "Choose practice test", url: extendUrl(context, 'practice_tests')}]
});

const BoardsByTopicCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Try our sample question packs",
        subtitle: "You can also work through some of our convenient sample question packs across a wide range of topics."
    },
    icon: {type: "hex", icon: "page-icon-question-pack"},
    subject: context.subject,
    linkTags: [{tag: "View question packs", url: extendUrl(context, 'question_packs')}]
});

// TODO: replace the link tags with links to lessons by *field* (see designs)
const LessonsAndRevisionCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Lessons and revision",
        subtitle: "Explore our lessons and revision resources to help you with your studies."
    },
    icon: {type: "hex", icon: "page-icon-lessons"},
    subject: context.subject,
    linkTags: [{tag: "View lessons", url: extendUrl(context, 'lessons')}]
});

const QuickQuizzesCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => ({
    item: {
        title: "Test your knowledge with our quick quizzes",
        subtitle: "The quizzes will help you to revise, rearrange equations, change units and practise extracting the correct information from a question."
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

const MathsSkillsQuestionsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Maths skills questions", "Explore our maths skills questions.", [{tag: "View maths skills questions", url: extendUrl(context, 'skills_questions')}])(context);
};

const BiologyStretchQuestionsCard = (context: NonNullable<Required<PageContextState>>): ListViewCardProps => {
    return ArbitraryPageLinkCard("Stretch questions", "Explore our stretch questions.", [{tag: "View stretch questions", url: extendUrl(context, 'stretch_questions')}])(context);
};

const subjectSpecificCardsMap: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: (LandingPageCard | null)[]}} = {
    "physics": {
        "11_14": [BoardsByTopicCard, null, null],
        "gcse": [BoardsByTopicCard, LessonsAndRevisionCard, QuickQuizzesCard],
        "a_level": [BoardsByTopicCard, LessonsAndRevisionCard, null],
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
        "a_level": [BoardsByTopicCard, GlossaryCard, BiologyStretchQuestionsCard],
    }
};

// constructs a map similar to above for relevant books (pulled from isaacBooks).
const subjectSpecificBooksMap: {[subject in keyof typeof PHY_NAV_SUBJECTS]: {[stage in typeof PHY_NAV_SUBJECTS[subject][number]]: BookInfo[]}} = (
    Object.entries(PHY_NAV_SUBJECTS).reduce((acc, [subject, stages]) => {
        acc[subject as keyof typeof PHY_NAV_SUBJECTS] = stages.reduce((stageAcc, stage) => {
            stageAcc[stage] = isaacBooks.filter(book => book.subject === subject && book.stages.includes(stage));
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
    if (!isDefinedContext(context)) return [];
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
    if (!isDefinedContext(context)) return [];
    if (!isSingleStageContext(context)) return [];

    return subjectSpecificBooksMap[context.subject][context.stage[0] as keyof typeof subjectSpecificBooksMap[typeof context.subject]] || [];
};
