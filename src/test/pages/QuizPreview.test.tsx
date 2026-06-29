import { expectLinkWithEnabledBackwardsNavigation, expectH1, expectH4, expectUrl } from "../testUtils";
import { mockPreviews } from "../../mocks/data";
import { isPhy, siteSpecific } from "../../app/services";
import { expectActionMessage, expectAdaBreadCrumbs, expectErrorMessage, expectPhyBreadCrumbs, expectMobileSidebarToggleToHaveText, expectRubric, renderQuizPage, quizSidebarCommonTests, testSectionsHeader } from "../helpers/quiz";
import { screen } from "@testing-library/react";

describe("QuizPreview", () => {
    const quizId = Object.keys(mockPreviews)[0];
    const preview = mockPreviews[quizId];
    const sections = preview.children;

    const renderQuizPreview = renderQuizPage('/test/preview');
    const renderQuizPreviewAsTeacher = () => renderQuizPreview({ role: 'TEACHER', quizId });

    describe("overview", () => {
        it('shows quiz title on the breadcrumbs', async () => {
            await renderQuizPreviewAsTeacher();
            siteSpecific(
                () => expectPhyBreadCrumbs({href: "/set_tests", text: "Set / manage tests"}),
                () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/set_tests", text: "Tests"}, `${preview.title} Preview`])
            )();
        });

        it('shows quiz title', async () => {
            await renderQuizPreviewAsTeacher();
            expectH1(`${preview.title} Preview`);
        });

        it('shows message about this page', async () => {
            await renderQuizPreviewAsTeacher();
            expectActionMessage('You are previewing this test.');
        });

        it('shows quiz rubric', async () => {
            await renderQuizPreviewAsTeacher();
            expectRubric(preview.rubric?.children?.[0].value);
        });

        it("shows Test sections that load section and allow navigating back", async () => {
            await renderQuizPreviewAsTeacher();
            expect(testSectionsHeader()).toBeInTheDocument();
            await expectLinkWithEnabledBackwardsNavigation(sections?.[0].title, `/test/preview/${quizId}/page/1`, `/test/preview/${quizId}`);
            await expectLinkWithEnabledBackwardsNavigation(sections?.[1].title, `/test/preview/${quizId}/page/2`, `/test/preview/${quizId}`);
        });

        it('shows "View questions" button that loads first page and allows navigating back', async () => {
            await renderQuizPreviewAsTeacher();
            await expectLinkWithEnabledBackwardsNavigation("View questions", `/test/preview/${quizId}/page/1`, `/test/preview/${quizId}`);
        });
    });

    describe("question page", () => {
        const renderQuizPreviewAsTeacherAtPage = (p: number) => renderQuizPreview({ role: 'TEACHER', quizId: `${quizId}/page/${p}` });

        it('shows "Back" button that loads previous page and allows navigating back', async () => {
            await renderQuizPreviewAsTeacherAtPage(1);
            await expectLinkWithEnabledBackwardsNavigation("Back", `/test/preview/${quizId}`, `/test/preview/${quizId}/page/1`);
        });

        it('shows "Next" button that loads following page and allows navigating back', async () => {
            await renderQuizPreviewAsTeacherAtPage(1);
            await expectLinkWithEnabledBackwardsNavigation("Next", `/test/preview/${quizId}/page/2`, `/test/preview/${quizId}/page/1`);
        });

        describe('on the last page', () => {
            it('shows "Back to Contents" button that loads overview page and allows navigating back', async () => {
                await renderQuizPreviewAsTeacherAtPage(2);
                await expectLinkWithEnabledBackwardsNavigation("Back to Contents", `/test/preview/${quizId}`, `/test/preview/${quizId}/page/2`);
            });
        });
    });

    describe('for students', () => {
        const renderInvalidQuizPreviewAsStudent = () => renderQuizPreview({ role: 'STUDENT', quizId: 'some_non_existent_test'});

        it('redirects to account upgrade', async () => {
            await renderInvalidQuizPreviewAsStudent();
            await expectUrl(siteSpecific('/pages/contact_us_teacher', '/teacher_account_request'));
        });
    });

    describe('for unregistered users', () => {
        const renderInvalidQuizPreviewAsAnonymous = () => renderQuizPreview({ role: 'ANONYMOUS', quizId: 'some_non_existent_test'});

        it('redirects to log in', async () => {
            await renderInvalidQuizPreviewAsAnonymous();
            await expectUrl('/login');
        });
    });

    describe('when quiz does not exist', () => {
        const renderInvalidQuizPreviewAsTeacher = () => renderQuizPreview({ role: 'TEACHER', quizId: 'some_non_existent_test'});

        it ('shows Test Preview on breadcrumbs', async () => {
            await renderInvalidQuizPreviewAsTeacher();
            siteSpecific(
                () => expectPhyBreadCrumbs({href: '/tests', text: "My tests"}),
                () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/tests", text: "Tests"}, "Test Preview"])
            )();
        });

        it('shows error', async () => {
            await renderInvalidQuizPreviewAsTeacher();
            expectH1('Test Preview');
            expectH4('Error loading test preview');
            expectErrorMessage('This test has become unavailable.');
        });
    });

    if (isPhy) {
        it('applies subject-specific theme', async () => {
            await renderQuizPreviewAsTeacher();
            expect(screen.getByTestId('quiz-preview')).toHaveAttribute('data-bs-theme', 'physics');
        });

        describe('shows the redesigned sidebar', quizSidebarCommonTests(renderQuizPreviewAsTeacher));

        it('sidebar toggle is called "Sections"', async () => {
            await renderQuizPreviewAsTeacher();
            await expectMobileSidebarToggleToHaveText("Sections");
        });
    }
});
