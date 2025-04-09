import {act, screen} from "@testing-library/react";
import {expectH1, expectH4, expectTextInElementWithId, expectTitledSection, expectUrl, renderTestEnvironment, setUrl, waitForLoaded} from "../testUtils";
import {mockRubrics} from "../../mocks/data";
import {isPhy} from "../../app/services";
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

    it('shows the rubric for the quiz', async () => {
        await renderQuizView({ role: 'STUDENT', pathname: `/test/view/${rubricId}/` });
        expectH1(mockRubric.title);
        expectTitledSection("Instructions", mockRubric.rubric?.children?.[0].value);
    });

    it('does not show the Set Test button', async () => {
        await renderQuizView({ role: 'STUDENT', pathname: `/test/view/${rubricId}/` });
        expect(setTestButton()).toBe(null);
    });

    it("does not show the edit button", async () => {
        await renderQuizView({ role: 'STUDENT', pathname: `/test/view/${rubricId}/` });
        expect(editButton()).toBe(null);
    });

    it("does not show Test sections", async () => {
        await renderQuizView({ role: 'STUDENT', pathname: `/test/view/${rubricId}/` });
        expect(testSectionsHeader()).toBe(null);
    });

    describe('for teachers', () => {
        it('shows the Set Test button', async () => {
            await renderQuizView({ role: 'TEACHER', pathname: `/test/view/${rubricId}/` });
            expect(setTestButton()).toBeInTheDocument();
        });

        it("does not show the edit button", async () => {
            await renderQuizView({ role: 'TEACHER', pathname: `/test/view/${rubricId}/` });
            expect(editButton()).toBe(null);
        });
    });

    describe('for content editors', () => {
        it('shows the Set Test Button', async () => {
            await renderQuizView({ role: 'CONTENT_EDITOR', pathname: `/test/view/${rubricId}/` });
            expect(setTestButton()).toBeInTheDocument();
        });

        // we'd need canonicalSourceFile for this, which the endpoint doesn't return
        it('does not show the edit button', async () => {
            await renderQuizView({ role: 'CONTENT_EDITOR', pathname: `/test/view/${rubricId}/` });
            expect(editButton()).toBe(null);
        });
    });

    describe('for unregistered users', () => {
        it('redirects to log in', async () => {
            await renderQuizView({ role: 'ANONYMOUS', pathname: '/test/view/some_non_existent_test'});
            await expectUrl('/login');
        });
    });

    describe('when a quiz does not exist', () => {
        it('shows an error', async () => {
            await renderQuizView({ role: 'STUDENT', pathname: '/test/view/some_non_existent_test'});
            expectH1('Viewing Test');
            expectH4('There was an error loading that test.');
            expectErrorMessage('This test has become unavailable.');
        });
    });
});

const expectErrorMessage = expectTextInElementWithId('error-message');
const setTestButton = () => screen.queryByRole('button', {name: "Set Test"});
const editButton = () => screen.queryByRole('heading', {name: "Published ✎"});
const testSectionsHeader = () => screen.queryByRole('heading', {name: "Test sections"});