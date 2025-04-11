import {act, screen, within} from "@testing-library/react";
import { expectLinkWithEnabledBackwardsNavigation, expectH1, expectH4, expectTextInElementWithId, expectTitledSection, expectUrl, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";
import {mockAttempts} from "../../mocks/data";
import type {UserRole} from "../../IsaacApiTypes";
import { siteSpecific } from "../../app/services";

describe("QuizAttempt", () => {
    const quizId = Object.keys(mockAttempts)[0];
    const attempt = mockAttempts[quizId];
    const sections = attempt.quiz?.children;

    const renderQuizAttempt =  async ({role, quizId}: {role: UserRole | "ANONYMOUS", quizId: string}) => {
        await act(async () => renderTestEnvironment({ role }));
        await act(async () => setUrl({ pathname: `/test/attempt/${quizId}` }));
        await waitForLoaded();
    };

    const studentAttemptsQuiz = () => renderQuizAttempt({ role: 'STUDENT', quizId });

    describe("overview", () => {
        it('shows quiz title on the breadcrumbs', async () => {
            await studentAttemptsQuiz();
            expectBreadcrumbs([{href: '/', text: "Home"}, {href: "/tests", text: siteSpecific("My Tests", "My tests")}, attempt.quiz?.title]);
        });

        it('shows quiz title', async () => {
            await studentAttemptsQuiz();
            expectH1(attempt.quiz?.title);
        });

        it('shows message about this page', async () => {
            await studentAttemptsQuiz();
            expectActionMessage('You are freely attempting this test.');
        });

        it('shows quiz rubric', async () => {
            await studentAttemptsQuiz();
            expectTitledSection("Instructions", attempt.quiz?.rubric?.children?.[0].value);
        });

        it("shows Test sections that load section and allow navigating back", async () => {
            await studentAttemptsQuiz();
            expect(testSectionsHeader()).toBeInTheDocument();
            await expectLinkWithEnabledBackwardsNavigation(sections?.[0].title, `/test/attempt/${quizId}/page/1`, `/test/attempt/${quizId}`);
            await expectLinkWithEnabledBackwardsNavigation(sections?.[1].title, `/test/attempt/${quizId}/page/2`, `/test/attempt/${quizId}`);
        });

        it('shows "Continue" button that loads first page and allows navigating back', async () => {
            await studentAttemptsQuiz();
            await expectLinkWithEnabledBackwardsNavigation("Continue", `/test/attempt/${quizId}/page/1`, `/test/attempt/${quizId}`);
        });
    });

    describe("question page", () => {
        const studentAttemptsQuestionPage = (p: number) => renderQuizAttempt({ role: 'STUDENT', quizId: `${quizId}/page/${p}` });

        it('shows "Back" button that loads previous page and allows navigating back', async () => {
            await studentAttemptsQuestionPage(1);
            await expectLinkWithEnabledBackwardsNavigation("Back", `/test/attempt/${quizId}`, `/test/attempt/${quizId}/page/1`);
        });

        it('shows "Next" button that loads following page and allows navigating back', async () => {
            await studentAttemptsQuestionPage(1);
            await expectLinkWithEnabledBackwardsNavigation("Next", `/test/attempt/${quizId}/page/2`, `/test/attempt/${quizId}/page/1`);
        });

        describe('on the last page', () => {
            it('shows "Finish" button that loads overview page and allows navigating back', async () => {
                await studentAttemptsQuestionPage(2);
                await expectLinkWithEnabledBackwardsNavigation("Finish", `/test/attempt/${quizId}`, `/test/attempt/${quizId}/page/2`);
            });
        });
    });

    describe('for unregistered users', () => {
        const anonymousAttemptsMissingQuiz = () => renderQuizAttempt({ role: 'ANONYMOUS', quizId: 'some_non_existent_test'}); 
        
        it('redirects to log in', async () => {
            await anonymousAttemptsMissingQuiz();
            await expectUrl('/login');
        });
    });

    describe('when quiz does not exist', () => {
        const studentAttemptsMissingQuiz = () => renderQuizAttempt({ role: 'STUDENT', quizId: 'some_non_existent_test'});

        it ('shows Unknown Test on breadcrumbs', async () => {
            await studentAttemptsMissingQuiz();
            expectBreadcrumbs([{href: '/', text: "Home"}, {href: "/tests", text: siteSpecific("My Tests", "My tests")}, "Test"]);
        });
        
        it('shows error', async () => {
            await studentAttemptsMissingQuiz();
            expectH1('Test');
            expectH4('Error loading test!');
            expectErrorMessage('This test has become unavailable.');
        });
    });
});

const expectErrorMessage = expectTextInElementWithId('error-message');
const expectActionMessage = expectTextInElementWithId('quiz-action');
const testSectionsHeader = () => screen.queryByRole('heading', {name: "Test sections"});
const expectBreadcrumbs = ([first, second, third]: [{href: string, text: string}, {href: string, text: string}, string | undefined]) => {
    const breadcrumbs = within(screen.getByRole('navigation', { name: 'breadcrumb' })).getByRole('list');
    expect(Array.from(breadcrumbs.children).map(e => e.innerHTML)).toEqual([
        `<a href="${first.href}"><span>${first.text}</span></a>`,
        `<a href="${second.href}"><span>${second.text}</span></a>`,
        `<span>${third}</span>`
    ]);
};
