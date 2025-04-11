import {act, screen, within} from "@testing-library/react";
import { expectLinkWithEnabledBackwardsNavigation, expectH1, expectH4, expectTextInElementWithId, expectTitledSection, expectUrl, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";
import {mockPreviews} from "../../mocks/data";
import type {UserRole} from "../../IsaacApiTypes";
import { siteSpecific } from "../../app/services";

describe("QuizAttempt", () => {
    const quizId = Object.keys(mockPreviews)[0];
    const preview = mockPreviews[quizId];
    const sections = preview.children;

    const rederQuizPreview =  async ({role, quizId}: {role: UserRole | "ANONYMOUS", quizId: string}) => {
        await act(async () => renderTestEnvironment({ role }));
        await act(async () => setUrl({ pathname: `/test/preview/${quizId}` }));
        await waitForLoaded();
    };

    const teacherPreviewsQuiz = () => rederQuizPreview({ role: 'TEACHER', quizId });

    describe("overview", () => {
        it('shows quiz title on the breadcrumbs', async () => {
            await teacherPreviewsQuiz();
            expectBreadcrumbs([{href: '/', text: "Home"}, {href: "/set_tests", text: siteSpecific("Set / Manage Tests", "Set tests")}, `${preview.title} Preview`]);
        });

        it('shows quiz title', async () => {
            await teacherPreviewsQuiz();
            expectH1(`${preview.title} Preview`);
        });

        it('shows message about this page', async () => {
            await teacherPreviewsQuiz();
            expectActionMessage('You are previewing this test.');
        });

        it('shows quiz rubric', async () => {
            await teacherPreviewsQuiz();
            expectTitledSection("Instructions", preview.rubric?.children?.[0].value);
        });

        it("shows Test sections that load section and allow navigating back", async () => {
            await teacherPreviewsQuiz();
            expect(testSectionsHeader()).toBeInTheDocument();
            await expectLinkWithEnabledBackwardsNavigation(sections?.[0].title, `/test/preview/${quizId}/page/1`, `/test/preview/${quizId}`);
            await expectLinkWithEnabledBackwardsNavigation(sections?.[1].title, `/test/preview/${quizId}/page/2`, `/test/preview/${quizId}`);
        });

        it('shows "View questions" button that loads first page and allows navigating back', async () => {
            await teacherPreviewsQuiz();
            await expectLinkWithEnabledBackwardsNavigation("View questions", `/test/preview/${quizId}/page/1`, `/test/preview/${quizId}`);
        });
    });

    describe("question page", () => {
        const teacherPreviewsQuestionPage = (p: number) => rederQuizPreview({ role: 'TEACHER', quizId: `${quizId}/page/${p}` });

        it('shows "Back" button that loads previous page and allows navigating back', async () => {
            await teacherPreviewsQuestionPage(1);
            await expectLinkWithEnabledBackwardsNavigation("Back", `/test/preview/${quizId}`, `/test/preview/${quizId}/page/1`);
        });

        it('shows "Next" button that loads following page and allows navigating back', async () => {
            await teacherPreviewsQuestionPage(1);
            await expectLinkWithEnabledBackwardsNavigation("Next", `/test/preview/${quizId}/page/2`, `/test/preview/${quizId}/page/1`);
        });

        describe('on the last page', () => {
            it('shows "Back to Contents" button that loads overview page and allows navigating back', async () => {
                await teacherPreviewsQuestionPage(2);
                await expectLinkWithEnabledBackwardsNavigation("Back to Contents", `/test/preview/${quizId}`, `/test/preview/${quizId}/page/2`);
            });
        });
    });

    describe('for students', () => {
        const studentPreviewsQuiz = () => rederQuizPreview({ role: 'STUDENT', quizId: 'some_non_existent_test'}); 
        
        it('redirects to account upgrade', async () => {
            await studentPreviewsQuiz();
            await expectUrl(siteSpecific('/pages/contact_us_teacher', '/teacher_account_request'));
        });
    });

    describe('for unregistered users', () => {
        const anonymousAttemptsMissingQuiz = () => rederQuizPreview({ role: 'ANONYMOUS', quizId: 'some_non_existent_test'}); 
        
        it('redirects to log in', async () => {
            await anonymousAttemptsMissingQuiz();
            await expectUrl('/login');
        });
    });

    describe('when quiz does not exist', () => {
        const teacherPreviewsMissingQuiz = () => rederQuizPreview({ role: 'TEACHER', quizId: 'some_non_existent_test'});

        it ('shows Unknown Test on breadcrumbs', async () => {
            await teacherPreviewsMissingQuiz();
            expectBreadcrumbs([{href: '/', text: "Home"}, {href: "/tests", text: siteSpecific("My Tests", "My tests")}, "Test Preview"]);
        });
        
        it('shows error', async () => {
            await teacherPreviewsMissingQuiz();
            expectH1('Test Preview');
            expectH4('Error loading test preview');
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
