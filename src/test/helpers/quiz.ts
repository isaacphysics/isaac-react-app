import {act, screen, within } from "@testing-library/react";
import { expectTextInElementWithId, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";
import { UserRole } from "../../IsaacApiTypes";

export const renderQuizPage = (baseUrl: string) => async ({role, quizId}: {role: UserRole | "ANONYMOUS", quizId: string}) => {
    await act(async () => renderTestEnvironment({ role }));
    await act(async () => setUrl({ pathname: `${baseUrl}/${quizId}` }));
    await waitForLoaded();
};

export const expectErrorMessage = expectTextInElementWithId('error-message');

export const expectActionMessage = expectTextInElementWithId('quiz-action');

export const setTestButton = () => screen.queryByRole('button', {name: "Set Test"});

export const editButton = () => screen.queryByRole('heading', {name: "Published ✎"});

export const previewButton = () => screen.queryByRole('link', {name: "Preview"});

export const testSectionsHeader = () => screen.queryByRole('heading', {name: "Test sections"});

export const expectPhyBreadCrumbs = ({href, text}: {href: string, text: string}) => {
    const breadcrumbs = within(screen.getByRole('navigation', { name: 'breadcrumb' })).getByRole('list');
    expect(Array.from(breadcrumbs.children).map(e => e.innerHTML)).toEqual([
        `<a href="${href}"><span>${text}</span></a>`,
    ]);
};

export const expectAdaBreadCrumbs = ([first, second, third]: [{href: string, text: string}, {href: string, text: string}, string | undefined]) => {
    const breadcrumbs = within(screen.getByRole('navigation', { name: 'breadcrumb' })).getByRole('list');
    expect(Array.from(breadcrumbs.children).map(e => e.innerHTML)).toEqual([
        `<a href="${first.href}"><span>${first.text}</span></a>`,
        `<a href="${second.href}"><span>${second.text}</span></a>`,
        `<span>${third}</span>`
    ]);
};