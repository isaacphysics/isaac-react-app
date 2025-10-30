import { screen, waitFor, within } from "@testing-library/react";
import { clickOn, enterInput, expectUrlParams, renderTestEnvironment, SearchString, setUrl, waitForLoaded, withMockedRandom} from "../testUtils";
import { mockQuestionFinderResults, mockQuestionFinderResultsWithMultipleStages } from "../../mocks/data";
import shuffle from "lodash/shuffle";
import times from "lodash/times";
import flatten from "lodash/flatten";
import { buildFunctionHandler } from "../../mocks/handlers";
import { isPhy, siteSpecific } from "../../app/services";
import userEvent from "@testing-library/user-event";
import { PageContextState } from "../../IsaacAppTypes";
import { expectPhyBreadCrumbs } from "../helpers/quiz";
import { IsaacQuestionPageDTO } from "../../IsaacApiTypes";
import { toggleFilter, PartialCheckboxState, Filter as F, expectPartialCheckBox } from "../../mocks/filters";

type QuestionFinderResultsResponse = {
    results: IsaacQuestionPageDTO[];
    nextSearchOffset: number;
    totalResults: number;
};

const buildMockQuestions = (n: number, questions: QuestionFinderResultsResponse): IsaacQuestionPageDTO[] => {
    return Array(n).fill(null).map((_, i) => ({ ...questions.results[i % questions.results.length], id: `q${i}`, title: `Question ${i}: ${questions.results[i % questions.results.length].title}` }));
};

const buildMockQuestionFinderResults = <T extends IsaacQuestionPageDTO[]>(questions: T, start: number): QuestionFinderResultsResponse => ({
    results: questions.slice(start, start + 31),
    nextSearchOffset: start + 31,
    totalResults: questions.length
});

describe("QuestionFinder", () => {
    const questions = buildMockQuestions(40, mockQuestionFinderResults as QuestionFinderResultsResponse);
    const resultsResponse = buildMockQuestionFinderResults(questions, 0);

    const questionsWithMultipleStages = buildMockQuestions(40, mockQuestionFinderResultsWithMultipleStages as QuestionFinderResultsResponse);
    const resultsResponseWithMultipleStages = buildMockQuestionFinderResults(questionsWithMultipleStages, 0);

    const renderQuestionFinderPage = async ({response, queryParams, context} : RenderParameters) => {
        renderTestEnvironment({
            extraEndpoints: [buildFunctionHandler('/pages/questions', ['tags', 'stages', 'randomSeed', 'startIndex'], response)]
        });
        await waitForLoaded();
        await setUrl({ pathname: context ? `/${context.subject}/${context.stage?.[0]}/questions` : '/questions', search: queryParams });
        await waitForLoaded();
    };

    it('should render results in alphabetical order', async () => {
        await renderQuestionFinderPage({ response: () => resultsResponse });
        await toggleFilter(F.GCSE);
        await expectQuestions(questions.slice(0, 30));
    });

    describe('Question shuffling', () => {
        const shuffledQuestions = shuffle(questions);
        const shuffledResultsResponse = buildMockQuestionFinderResults(shuffledQuestions, 0);

        const response: RenderParameters['response'] = ({randomSeed}) => {
            switch (randomSeed) {
                case null: return resultsResponse;
                case '1': return shuffledResultsResponse;
                default: throw new Error('Unexpected seed.');
            }
        };

        it('query parameter should shuffle results', async () => {
            await renderQuestionFinderPage({ response, queryParams: '?randomSeed=1&stages=gcse' });
            await expectQuestions(shuffledQuestions.slice(0, 30));
        });

        it('button should shuffle questions', async () => {
            await withMockedRandom(async (randomSequence) => {
                randomSequence([1 * 10 ** -6]);
                await renderQuestionFinderPage({ response });

                await toggleFilter(F.GCSE);
                await expectQuestions(questions.slice(0, 30));

                await clickOn("Shuffle");
                await expectQuestions(shuffledQuestions.slice(0, 30));
            });
        });

        it('button stores the seed in a URL parameter', () => {
            return withMockedRandom(async (randomSequence) => {
                randomSequence([1 * 10 ** -6]);

                await renderQuestionFinderPage({ response });
                await toggleFilter(F.GCSE);
                await clickOn("Shuffle");
                await expectUrlParams("?randomSeed=1&stages=gcse");
            });
        });

        describe('returning to alphabetical order from a randomised screen', () => {
            it('when applying filters', async () => {
                await renderQuestionFinderPage({ response, queryParams: "?randomSeed=1" });
                await toggleFilter(F.GCSE);
                await expectUrlParams("?stages=gcse");
                await expectQuestions(questions.slice(0, 30));
            });

            it('when searching for a question', async () => {
                await renderQuestionFinderPage({ response, queryParams: "?randomSeed=1" });
                await enterInput(siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST"), "A bag");
                await expectUrlParams("?query=A%20bag");
                await expectQuestions(questions.slice(0, 30));
            });

            if (isPhy) {
                // On Ada, clearing filters only has an affect after clicking the "Apply" button, so same case as above
                it('when clearing all filters', async () => {
                    await renderQuestionFinderPage({ response, queryParams: "?randomSeed=1&stages=gcse" });
                    await clickOn(siteSpecific("Clear all filters", "Clear all"));
                    await expectUrlParams('');
                });


                it('when clearing a filter tag', async () => {
                    await renderQuestionFinderPage({ response, queryParams: "?randomSeed=1&stages=gcse" });
                    await clearFilterTag('gcse');
                    await expectUrlParams('');
                });
            }
        });

        it('"Load more" should avoid duplicate questions by fetching next page using same seed', () => {
            const resultsResponsePage2 = buildMockQuestionFinderResults(questions, 30);
            const shuffledResultsResponsePage2 = buildMockQuestionFinderResults(shuffledQuestions, 30);

            return withMockedRandom(async (randomSequence) => {
                randomSequence([1 * 10 ** -6]);

                await renderQuestionFinderPage({ response: ({ randomSeed, startIndex }) => {
                    switch (randomSeed) {
                        case null: return startIndex === '0' ? resultsResponse : resultsResponsePage2;;
                        case '1': return startIndex === '0' ? shuffledResultsResponse : shuffledResultsResponsePage2;
                        default: throw new Error('Unexpected seed');
                    }
                }});
                await toggleFilter(F.GCSE);
                await expectQuestions(questions.slice(0, 30));
                await expectPageIndicator("Showing 30 of 40.");

                await clickOn("Shuffle");
                await expectQuestions(shuffledQuestions.slice(0, 30));
                await expectPageIndicator("Showing 30 of 40.");

                await clickOn("Load more");
                await expectQuestions(shuffledQuestions);
                await expectPageIndicator("Showing 40 of 40.");
            });
        });
    });

    if (isPhy) {
        describe('Filters', () => {
            // subject     field        topic
            // Phsysics -> Skills    -> Significant Figures
            //          -> Mechanics -> Statics
            // Maths    -> Number    -> Arithmetic
            //          -> Geometry  -> Shapes
            const [subjectFilters, fieldFilters, topicFilters] = [
                [F.Physics, F.Maths],
                [F.Skills, F.Mechanics, F.Number, F.Geometry],
                [F.SigFigs, F.Statics, F.Arithmetic, F.Shapes]
            ];
            const testedFilters = flatten([subjectFilters, fieldFilters, topicFilters]);
            const checkboxStates = (n: number) => (state: PartialCheckboxState) => times(n, () => state);
            const [subjects, fields, topics] = [checkboxStates(2), checkboxStates(4), checkboxStates(4)];
            const response = () => resultsResponse;
            const { Selected, Partial, Deselected, Hidden } = PartialCheckboxState;

            describe('initial state: no selections', () => {
                it('show unchecked subjects, hides others', async () => {
                    await renderQuestionFinderPage({ response });
                    expectPartialCheckBox(testedFilters).toBe([subjects(Deselected), fields(Hidden), topics(Hidden)]);

                });
                it('SELECT: fields', async () => {
                    await renderQuestionFinderPage({ response });
                    await toggleFilter(subjectFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Selected), fields(Deselected), topics(Hidden)]);
                });
            });

            describe('initial state: subject selected', () => {
                const queryParams = '?subjects=physics,maths';

                it('shows checked subjects, unchecked fields and no topics', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    expectPartialCheckBox(testedFilters).toBe([subjects(Selected), fields(Deselected), topics(Hidden)]);
                });

                it('SELECT: fields', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    await toggleFilter(fieldFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Partial), fields(Selected), topics(Deselected)]);
                });

                it('DESELECT: subjects', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    await toggleFilter(subjectFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Deselected), fields(Hidden), topics(Hidden)]);
                });
            });

            describe('initial state: subject and fields selected', () => {
                const queryParams = '?subjects=physics,maths&fields=skills,mechanics,number,geometry';

                it('shows partial subject, checked fields and deselected topics', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    expectPartialCheckBox(testedFilters).toBe([subjects(Partial), fields(Selected), topics(Deselected)]);
                });

                it('SELECT: topics', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    await toggleFilter(topicFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Partial), fields(Partial), topics(Selected)]);
                });

                it('DESELECT: fields', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    await toggleFilter(fieldFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Selected), fields(Deselected), topics(Hidden)]);
                });

                it('DESELECT: subjects', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    await toggleFilter(subjectFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Deselected), fields(Hidden), topics(Hidden)]);
                });
            });

            describe('initial state: subject, fields and topics selected', () => {
                const queryParams = `?subjects=physics,maths&fields=skills,mechanics,number,geometry${
                    '&topics=sig_figs,statics,arithmetic,shapes'}`;

                it('shows partial subject, partial fields and selected topics', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    expectPartialCheckBox(testedFilters).toBe([subjects(Partial), fields(Partial), topics(Selected)]);
                });

                it('DESELECT: topics', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    await toggleFilter(topicFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Partial), fields(Selected), topics(Deselected)]);
                });

                it('DESELECT: fields', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    await toggleFilter(fieldFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Selected), fields(Deselected), topics(Hidden)]);
                });

                it('DESELECT: subjects', async () => {
                    await renderQuestionFinderPage({ response, queryParams });
                    await toggleFilter(subjectFilters);
                    expectPartialCheckBox(testedFilters).toBe([subjects(Deselected), fields(Hidden), topics(Hidden)]);
                });
            });

            describe('on a conxtext-specific question finder', () => {
                // field        topic
                // Number    -> Arithmetic
                // Geometry  -> Shapes
                const context = { subject: "maths", stage: ["a_level"] } as RenderParameters['context'];
                const [fieldFilters, topicFilters] = [
                    [F.Number, F.Geometry],
                    [F.Arithmetic, F.Shapes]
                ];
                const testedFilters = [...fieldFilters, ...topicFilters];
                const [fields, topics] = [checkboxStates(2), checkboxStates(2)];

                describe('initial state: no selections', () => {
                    it('shows fields and hides topics', async () => {
                        await renderQuestionFinderPage({ response, context });
                        expectPartialCheckBox(testedFilters).toBe([fields(Deselected), topics(Hidden)]);
                    });

                    it('SELECT: fields', async () => {
                        await renderQuestionFinderPage({ response, context });
                        await toggleFilter(fieldFilters);
                        expectPartialCheckBox(testedFilters).toBe([fields(Selected), topics(Deselected)]);
                    });
                });

                describe('initial state: fields selected', () => {
                    const queryParams = '?fields=number,geometry';

                    it('shows selected fields, deselected topics', async () => {
                        await renderQuestionFinderPage({ response, context, queryParams });
                        expectPartialCheckBox(testedFilters).toBe([fields(Selected), topics(Deselected)]);
                    });

                    it('SELECT: topics', async () => {
                        await renderQuestionFinderPage({ response, context, queryParams });
                        await toggleFilter(topicFilters);
                        expectPartialCheckBox(testedFilters).toBe([fields(Partial), topics(Selected)]);
                    });

                    it('DESELECT: fields', async () => {
                        await renderQuestionFinderPage({ response, context, queryParams });
                        await toggleFilter(fieldFilters);
                        expectPartialCheckBox(testedFilters).toBe([fields(Deselected), topics(Hidden)]);
                    });
                });

                describe('initial state: fields and topics selected', () => {
                    const queryParams = '?fields=number,geometry&topics=arithmetic,shapes';

                    it('shows partial fields, selected topics', async () => {
                        await renderQuestionFinderPage({ response, context, queryParams });
                        expectPartialCheckBox(testedFilters).toBe([fields(Partial), topics(Selected)]);
                    });

                    it('DESELECT: topics', async () => {
                        await renderQuestionFinderPage({ response, context, queryParams });
                        await toggleFilter(topicFilters);
                        expectPartialCheckBox(testedFilters).toBe([fields(Selected), topics(Deselected)]);
                    });

                    it('DESELECT: fields', async () => {
                        await renderQuestionFinderPage({ response, context, queryParams });
                        await toggleFilter(fieldFilters);
                        expectPartialCheckBox(testedFilters).toBe([fields(Deselected), topics(Hidden)]);
                    });
                });
            });
        });
    }

    describe('Context-specific question finder', () => {
        if (isPhy) {
            it('breadcrumb leads back to the landing page for the context', async () => {
                await renderQuestionFinderPage({
                    response: () => resultsResponse,
                    context: { subject: "physics", stage: ["gcse"] },
                });
                expectPhyBreadCrumbs({href: "/physics/gcse", text: "GCSE Physics"});
            });

            it('only fetches questions for the context', async () => {
                const getQuestionsWithMultipleStages = jest.fn(() => resultsResponseWithMultipleStages);

                await renderQuestionFinderPage({
                    response: getQuestionsWithMultipleStages,
                    context: { subject: "physics", stage: ["a_level"] },
                });

                await waitFor(() => expect(getQuestionsWithMultipleStages).toHaveBeenCalledWith(expect.objectContaining({
                    tags: "physics",
                    stages: "a_level,further_a",
                })));
            });

            it('"Load more" only fetches questions for the context', async () => {
                const getQuestionsWithMultipleStages = jest.fn(() => resultsResponseWithMultipleStages);

                await renderQuestionFinderPage({
                    response: getQuestionsWithMultipleStages,
                    context: { subject: "physics", stage: ["a_level"] },
                });

                await clickOn("Load more");

                await waitFor(() => expect(getQuestionsWithMultipleStages).toHaveBeenLastCalledWith(expect.objectContaining({
                    tags: "physics",
                    stages: "a_level,further_a",
                })));
            });

            describe('fields and topics', () => {
                it('are specific to A-level maths', async () => {
                    await renderQuestionFinderPage({
                        response: () => resultsResponse,
                        context: { subject: "maths", stage: ["a_level"] },
                    });
                    await toggleFilter(
                        [F.Number, F.Algebra, F.Geometry, F.Functions, F.Calculus, F.Statistics, F.Mechanics]
                    );

                    const numberTopics = [F.Arithmetic, F.RationalNumbers, F.FactorsPowers, F.ComplexNumbers];
                    const algebraTopics = [F.Manipulation, F.Quadratics, F.SimultaneousEquations, F.Series, F.Matrices];
                    const geometryTopics = [F.Shapes, F.Trigonometry, F.Vectors, F.Planes, F.Coordinates];
                    const functionTopics = [F.GeneralFunctions, F.GraphSketching];
                    const calculusTopics = [F.Differentiation, F.Integration, F.DifferentialEquations];
                    const statisticsTopics = [F.DataAnalysis, F.Probablity, F.RandomVariables, F.HypothesisTests];
                    const mechanicsTopics = [
                        F.Statics, F.Kinematics, F.Dynamics, F.CircularMotion, F.Oscillations, F.Materials
                    ];
                    expect(queryFilters()).toEqual([
                        F.Number, ...numberTopics, F.Algebra, ...algebraTopics,
                        F.Geometry, ...geometryTopics, F.Functions, ...functionTopics, F.Calculus, ...calculusTopics,
                        F.Statistics, ...statisticsTopics, F.Mechanics, ...mechanicsTopics
                    ]);
                });

                it('are specific to GCSE maths', async () => {
                    await renderQuestionFinderPage({
                        response: () => resultsResponse,
                        context: { subject: "maths", stage: ["gcse"] },
                    });
                    await toggleFilter( [F.Number, F.Algebra, F.Geometry, F.Functions, F.Statistics]);

                    const numberTopics = [F.Arithmetic, F.RationalNumbers, F.FactorsPowers];
                    const algebraTopics = [F.Manipulation, F.Quadratics, F.SimultaneousEquations, F.Series];
                    const geometryTopics = [F.Shapes, F.Trigonometry, F.Vectors, F.Coordinates];
                    const functionTopics = [F.GeneralFunctions, F.GraphSketching];
                    const statisticsTopics = [F.DataAnalysis, F.Probablity];
                    expect(queryFilters()).toEqual([
                        F.Number, ...numberTopics, F.Algebra, ...algebraTopics, F.Geometry, ...geometryTopics,
                        F.Functions, ...functionTopics, F.Statistics, ...statisticsTopics
                    ]);
                });
            });
        }
    });
});

type RenderParameters = {
    response: (options: {
        tags: string | null;
        stages: string | null;
        randomSeed: string | null;
        startIndex: string | null;
    }) => QuestionFinderResultsResponse;
    queryParams?: SearchString;
    context?: NonNullable<PageContextState>;
};

const findQuestions = () => screen.findByTestId("question-finder-results").then(e => within(e).findAllByRole('listitem'));

const getQuestionText = (q: HTMLElement) => q.querySelector(isPhy ? '.question-link-title > span' : 'span.question-link-title')?.textContent;

const expectQuestions = (expectedQuestions: IsaacQuestionPageDTO[]) => waitFor(async () => {
    const found = await findQuestions();
    expect(found.length).toEqual(expectedQuestions.length);
    expect(found.map(getQuestionText)).toEqual(expectedQuestions.map(q => q.title));
}, { timeout: 5000 });

const expectPageIndicator = (content: string) => screen.findByTestId("question-finder-results").then(found => {
    expect(found.querySelector('[data-testid="question-finder-results-header"]')?.textContent).toBe(content);
});

const clearFilterTag = async (tagId: string) => {
    const tag = await screen.findByTestId(`filter-tag-${tagId}`);
    const button = await within(tag).findByRole('button');
    await userEvent.click(button);
};

const queryFilters = () => {
    const topicFilters = screen.getByRole('button', { name: /Topic.*/ }).parentElement?.parentElement;
    if (!topicFilters) {
        throw new Error("Topic filters not found");
    }
    return within(topicFilters).getAllByRole('checkbox').map(e => isInput(e) && e.labels && e.labels.length > 0 && e.labels[0].textContent);
};

const isInput = (element: HTMLElement): element is HTMLInputElement => {
    return element.tagName.toLowerCase() === 'input';
};