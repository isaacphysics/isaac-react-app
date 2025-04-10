import {act, screen, waitFor, within} from "@testing-library/react";
import { expectButtonWithEnabledBackwardsNavigation, expectH1, expectH4, expectTextInElementWithId, expectTitledSection, expectUrl, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";
import {mockRubrics} from "../../mocks/data";
import {isPhy, siteSpecific} from "../../app/services";
import type {UserRole} from "../../IsaacApiTypes";

describe("QuizView", () => {
    if (!isPhy) {
        return it('does not exist yet', () => {});
    };

    const rubricId = Object.keys(mockRubrics)[0];
    const mockRubric = mockRubrics[rubricId];

    const renderQuizView =  async ({role, pathname}: {role: UserRole | "ANONYMOUS", pathname: string}) => {
        await act(async () => renderTestEnvironment({ role }));
        await act(async () => setUrl({ pathname }));
        await waitForLoaded();
    };

    const studentViewsQuiz = () => renderQuizView({ role: 'STUDENT', pathname: `/test/view/${rubricId}` }); 

    it('shows quiz title on the breadcrumbs', async () => {
        await studentViewsQuiz();
        siteSpecific(
            () => expectPhyBreadCrumbs({href: "/practice_tests", text: "Practice Tests"}),
            () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/practice_tests", text: "Practice Tests"}, mockRubric.title])
        )();
    });

    it('shows quiz title', async () => {
        await studentViewsQuiz();
        expectH1(mockRubric.title);
    });

    it('shows message about this page', async () => {
        await studentViewsQuiz();
        expectActionMessage('You are viewing the rubric for this test.');
    });

    it('does not show Set Test button', async () => {
        await studentViewsQuiz();
        expect(setTestButton()).toBe(null);
    });

    it('shows quiz rubric', async () => {
        await studentViewsQuiz();
        expectTitledSection("Instructions", mockRubric.rubric?.children?.[0].value);
    });

    it("does not show Test sections", async () => {
        await studentViewsQuiz();
        expect(testSectionsHeader()).toBe(null);
    });

    it('shows "Take Test" button that loads the attempts page and allows navigating back', async () => {
        await studentViewsQuiz();
        await expectButtonWithEnabledBackwardsNavigation("Take Test", `/test/attempt/${rubricId}`, `/test/view/${rubricId}`);
    });

    it('does not show "Preview" button', async() => {
        await studentViewsQuiz();
        expect(previewButton()).toBe(null);
    });

    describe('for teachers', () => {
        const teacherViewsQuiz = () => renderQuizView({ role: 'TEACHER', pathname: `/test/view/${rubricId}` }); 
        
        it('shows Set Test button', async () => {
            await teacherViewsQuiz();
            expect(setTestButton()).toBeInTheDocument();
        });

        it('shows "Preview" button that loads the preview page and allows navigating back', async () => {
            await teacherViewsQuiz();
            await expectButtonWithEnabledBackwardsNavigation("Preview", `/test/preview/${rubricId}`, `/test/view/${rubricId}`);
        });
    });

    describe('for content editors', () => {
        const editorViewsQuiz = () => renderQuizView({ role: 'TEACHER', pathname: `/test/view/${rubricId}` });

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
            await expectButtonWithEnabledBackwardsNavigation("Preview", `/test/preview/${rubricId}`, `/test/view/${rubricId}`);
        });
    });

    describe('for unregistered users', () => {
        const anonymousViewsMissingQuiz = () => renderQuizView({ role: 'ANONYMOUS', pathname: '/test/view/some_non_existent_test'}); 
        
        it('redirects to log in', async () => {
            await anonymousViewsMissingQuiz();
            await expectUrl('/login');
        });
    });

    describe('when quiz does not exist', () => {
        const studentViewsMissingQuiz = () => renderQuizView({ role: 'STUDENT', pathname: '/test/view/some_non_existent_test'});

        it ('shows Unknown Test on breadcrumbs', async () => {
            await studentViewsMissingQuiz();
            siteSpecific(
                () => expectPhyBreadCrumbs({href: '/practice_tests', text: "Practice Tests"}),
                () => expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/practice_tests", text: "Practice Tests"}, "Unknown Test"])
            )();
        });
        
        it('shows error', async () => {
            await studentViewsMissingQuiz();
            expectH1('Unknown Test');
            expectH4('There was an error loading that test.');
            expectErrorMessage('This test has become unavailable.');
        });
    });
});

const expectErrorMessage = expectTextInElementWithId('error-message');
const expectActionMessage = expectTextInElementWithId('quiz-action');
const setTestButton = () => screen.queryByRole('button', {name: "Set Test"});
const editButton = () => screen.queryByRole('heading', {name: "Published ✎"});
const previewButton = () => screen.queryByRole('link', {name: "Preview"});
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
