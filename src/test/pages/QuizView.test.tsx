import {expectH1, expectH4, expectLink, expectUrl} from "../testUtils";
import {mockRubrics} from "../../mocks/data";
import {
    expectAdaBreadCrumbs,
    expectErrorMessage,
    expectPhyBreadCrumbs,
    expectRubric,
    expectMobileSidebarToggleToHaveText,
    previewTestButtonLocator,
    renderQuizPage,
    quizSidebarCommonTests,
    testSectionsHeaderLocator
} from "../helpers/quiz";
import {isPhy, siteSpecific} from "../../app/services";
import {screen} from "@testing-library/react";

describe("QuizView", () => {
    const quizId = Object.keys(mockRubrics)[0];
    const rubric = mockRubrics[quizId];

    const renderQuizView = renderQuizPage('/test/view');
    const studentViewsQuiz = () => renderQuizView({ role: 'STUDENT', quizId });

    it('shows quiz title on the breadcrumbs', async () => {
        await studentViewsQuiz();
        siteSpecific(
            () => expectPhyBreadCrumbs({href: "/view_tests", text: "View tests"}),
            () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/view_tests", text: "View tests"}, rubric.title])
        )();
    });

    it('shows quiz title', async () => {
        await studentViewsQuiz();
        expectH1(rubric.title);
    });

    it('shows message about this page', async () => {
        await studentViewsQuiz();
        expect(screen.queryByTestId("quiz-action")).toBeInTheDocument();
    });

    it('shows quiz rubric', async () => {
        await studentViewsQuiz();
        expectRubric(rubric.rubric?.children?.[0].value);
    });

    it("does not show Test sections", async () => {
        await studentViewsQuiz();
        expect(testSectionsHeaderLocator()).toBe(null);
    });

    it('shows "Take Test" button that loads the attempts page', async () => {
        await studentViewsQuiz();
        await expectLink("Take Test", `/test/attempt/${quizId}`);
    });

    it('does not show "Preview questions" button', async() => {
        await studentViewsQuiz();
        expect(previewTestButtonLocator()).toBe(null);
    });

    // Teachers should never be directed to the /view page. If they end up there, they see the same as students.

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
                () => expectPhyBreadCrumbs({href: '/view_tests', text: "View tests"}),
                () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/view_tests", text: "View tests"}, "Unknown Test"])
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

        describe('shows the redesigned sidebar', quizSidebarCommonTests(studentViewsQuiz));

        it('sidebar toggle is called "Details"', async () => {
            await studentViewsQuiz();
            await expectMobileSidebarToggleToHaveText("Details");
        });
    }
});
