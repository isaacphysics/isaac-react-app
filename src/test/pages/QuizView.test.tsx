import { expectLinkWithEnabledBackwardsNavigation, expectH1, expectH4, expectUrl } from "../testUtils";
import {mockRubrics} from "../../mocks/data";
import { editButton,  expectAdaBreadCrumbs,  expectErrorMessage, expectPhyBreadCrumbs, expectRubric, expectSidebarToggle, previewButton, renderQuizPage, setTestButton, sideBarTestCases, testSectionsHeader } from "../helpers/quiz";
import { isPhy, siteSpecific } from "../../app/services";
import {screen } from "@testing-library/react";

describe("QuizView", () => {
    const quizId = Object.keys(mockRubrics)[0];
    const rubric = mockRubrics[quizId];

    const renderQuizView = renderQuizPage('/test/view');
    const studentViewsQuiz = () => renderQuizView({ role: 'STUDENT', quizId }); 

    it('shows quiz title on the breadcrumbs', async () => {
        await studentViewsQuiz();
        siteSpecific(
            () => expectPhyBreadCrumbs({href: "/practice_tests", text: "Practice tests"}),
            () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/practice_tests", text: "Practice tests"}, rubric.title])
        )();
    });

    it('shows quiz title', async () => {
        await studentViewsQuiz();
        expectH1(rubric.title);
    });

    it('does not show message about this page', async () => {
        await studentViewsQuiz();
        expect(screen.queryByTestId("quiz-action")).not.toBeInTheDocument();
    });

    it('does not show Set Test button', async () => {
        await studentViewsQuiz();
        expect(setTestButton()).toBe(null);
    });

    it('shows quiz rubric', async () => {
        await studentViewsQuiz();
        expectRubric(rubric.rubric?.children?.[0].value);
    });

    it("does not show Test sections", async () => {
        await studentViewsQuiz();
        expect(testSectionsHeader()).toBe(null);
    });

    it('shows "Take Test" button that loads the attempts page and allows navigating back', async () => {
        await studentViewsQuiz();
        await expectLinkWithEnabledBackwardsNavigation("Take Test", `/test/attempt/${quizId}`, `/test/view/${quizId}`);
    });

    it('does not show "Preview" button', async() => {
        await studentViewsQuiz();
        expect(previewButton()).toBe(null);
    });

    describe('for teachers', () => {
        const teacherViewsQuiz = () => renderQuizView({ role: 'TEACHER', quizId }); 
        
        it('shows Set Test button', async () => {
            await teacherViewsQuiz();
            expect(setTestButton()).toBeInTheDocument();
        });

        it('shows "Preview" button that loads the preview page and allows navigating back', async () => {
            await teacherViewsQuiz();
            await expectLinkWithEnabledBackwardsNavigation("Preview", `/test/preview/${quizId}`, `/test/view/${quizId}`);
        });
    });

    describe('for content editors', () => {
        const editorViewsQuiz = () => renderQuizView({ role: 'TEACHER', quizId });

        it('shows Set Test Button', async () => {
            await editorViewsQuiz();
            expect(setTestButton()).toBeInTheDocument();
        });

        // It'd be more consistent with, eg. the `/preview` page to show the edit button.
        // However, we'd need `canonicalSourceFile` for this, which the `/rubric` endpoint doesn't return.
        // For now, James suggested this was not worth the effort.
        it('does not show edit button', async () => {
            await editorViewsQuiz();
            expect(editButton()).toBe(null);
        });

        it('shows "Preview" button that loads the preview page and allows navigating back', async () => {
            await editorViewsQuiz();
            await expectLinkWithEnabledBackwardsNavigation("Preview", `/test/preview/${quizId}`, `/test/view/${quizId}`);
        });
    });

    describe('for unregistered users', () => {
        const anonymousViewsMissingQuiz = () => renderQuizView({ role: 'ANONYMOUS', quizId: 'some_non_existent_test'}); 
        
        it('redirects to log in', async () => {
            await anonymousViewsMissingQuiz();
            await expectUrl('/login');
        });
    });

    describe('when quiz does not exist', () => {
        const studentViewsMissingQuiz = () => renderQuizView({ role: 'STUDENT', quizId: 'some_non_existent_test'});

        it ('shows Unknown Test on breadcrumbs', async () => {
            await studentViewsMissingQuiz();
            siteSpecific(
                () => expectPhyBreadCrumbs({href: '/practice_tests', text: "Practice tests"}),
                () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/practice_tests", text: "Practice tests"}, "Unknown Test"])
            )();
        });
        
        it('shows error', async () => {
            await studentViewsMissingQuiz();
            expectH1('Unknown Test');
            expectH4('There was an error loading that test.');
            expectErrorMessage('This test has become unavailable.');
        });
    });

    if (isPhy) {
        it('applies subject-specific theme', async () => {
            await studentViewsQuiz();
            expect(screen.getByTestId('quiz-view')).toHaveAttribute('data-bs-theme', 'physics');
        });

        describe('shows the redesigned sidebar', sideBarTestCases(studentViewsQuiz));

        it('sidebar toggle is called "Details"', async () => {
            await studentViewsQuiz();
            await expectSidebarToggle("Details");
        });
    }
});
