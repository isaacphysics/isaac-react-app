import {act, screen, within} from "@testing-library/react";
import { expectButtonWithEnabledBackwardsNavigation, expectH1, expectH4, expectTextInElementWithId, expectTitledSection, expectUrl, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";
import {mockAttempts} from "../../mocks/data";
import type {UserRole} from "../../IsaacApiTypes";
import { siteSpecific } from "../../app/services";

describe("QuizAttempt", () => {
    const quizId = Object.keys(mockAttempts)[0];
    const attempt = mockAttempts[quizId];

    const renderQuizAttempt =  async ({role, quizId}: {role: UserRole | "ANONYMOUS", quizId: string}) => {
        await act(async () => renderTestEnvironment({ role }));
        await act(async () => setUrl({ pathname: `/test/attempt/${quizId}` }));
        await waitForLoaded();
    };

    const studentAttemptsQuiz = () => renderQuizAttempt({ role: 'STUDENT', quizId });

    describe("overview", () => {
        it('shows quiz title on the breadcrumbs', async () => {
            await studentAttemptsQuiz();
            siteSpecific(
                () => expectPhyBreadCrumbs({href: "/tests", text: "My Tests"}),
                () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/tests", text: "My tests"}, attempt.quiz?.title])
            )();
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

        // TODO: assert what the sections are
        it("shows Test sections", async () => {
            await studentAttemptsQuiz();
            expect(testSectionsHeader()).toBeInTheDocument();
        });

        it('shows "Continue" button that loads the attempts page and allows navigating back', async () => {
            await studentAttemptsQuiz();
            await expectButtonWithEnabledBackwardsNavigation("Continue", `/test/attempt/${quizId}/page/1`, `/test/attempt/${quizId}`);
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

        it ('shows Test on breadcrumbs', async () => {
            await studentAttemptsMissingQuiz();
            siteSpecific(
                () => expectPhyBreadCrumbs({href: "/tests", text: "My Tests"}),
                () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/tests", text: "My tests"}, "Test"])
            )();
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
const expectPhyBreadCrumbs = ({href, text}: {href: string, text: string}) => {
    const breadcrumbs = within(screen.getByRole('navigation', { name: 'breadcrumb' })).getByRole('list');
    expect(Array.from(breadcrumbs.children).map(e => e.innerHTML)).toEqual([
        `<a href="${href}"><span>${text}</span></a>`,
    ]);
};
const expectAdaBreadCrumbs = ([first, second, third]: [{href: string, text: string}, {href: string, text: string}, string | undefined]) => {
    const breadcrumbs = within(screen.getByRole('navigation', { name: 'breadcrumb' })).getByRole('list');
    expect(Array.from(breadcrumbs.children).map(e => e.innerHTML)).toEqual([
        `<a href="${first.href}"><span>${first.text}</span></a>`,
        `<a href="${second.href}"><span>${second.text}</span></a>`,
        `<span>${third}</span>`
    ]);
};
