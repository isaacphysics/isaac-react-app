import { screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { isPhy } from "../../app/services";
import { expectH1, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";
import { mockRedirects } from "../../mocks/utils";
import { times } from "lodash";
import { UserRole } from "../../IsaacApiTypes";

describe('Overview page', () => {
    if (isPhy) {
        it('has no such page', () => {});
    } else {
        mockRedirects();
        const renderOverviewPage = async (role: UserRole | "ANONYMOUS" = 'TEACHER') => {
            renderTestEnvironment({ role });
            await waitForLoaded();
            act(() => setUrl({ pathname: '/dashboard' }));
            await waitForLoaded();
        };

        it('is only shown for teachers', async () => {
            await renderOverviewPage('STUDENT');
            expectH1('Upgrade to a teacher account');
        });

        it('shows the heading', async () => {
            await renderOverviewPage(); 
            expectH1('Overview');
        });

        describe('Teacher onboarding modal', () => {
            describe('on the first page', () => {
                it('shows the first page', async () => {
                    await renderOverviewPage();
                    expect(modal.pages).toHaveTextContent('1 of 4');
                });

                it('shows the text and picture for the first page', async () => {
                    await renderOverviewPage();
                    expect(modal.body).toHaveTextContent(/Welcome to Ada(\s)*Ada supports your teaching.*/);
                    expect(modal.image).toHaveAttribute('src', '/assets/cs/decor/onboarding-welcome.svg');
                });

                it('shows a "Next" button', async () => {
                    await renderOverviewPage();
                    expect(modal.forwardButton).toHaveTextContent('Next');
                });

                it('can be dismissed by closing the modal', async () => {
                    await renderOverviewPage();
                    userEvent.click(modal.closeButton);
                    await waitFor(() => expect(modal.element.maybe).toBeNull());
                });
            });

            describe('on the last page', () => {
                const renderLastPage = async () => {
                    await renderOverviewPage();
                    times(3, () => userEvent.click(modal.forwardButton));
                };

                it('shows the last page', async () => {
                    await renderLastPage();
                    await waitFor(() => expect(modal.pages).toHaveTextContent('4 of 4'));
                });

                it('shows the text and picture for the last page', async () => {
                    await renderLastPage();
                    await waitFor(() => {
                        expect(modal.body).toHaveTextContent(/See your students progress(\s)*See how students perf.*/);
                        expect(modal.image).toHaveAttribute('src', '/assets/cs/decor/onboarding-students-progress.svg');
                    });
                });

                it ('shows a "Go to My Ada" button that dismisses the modal', async () => {
                    await renderLastPage();
                    await waitFor(() => expect(modal.forwardButton).toHaveTextContent("Go to My Ada"));
                    userEvent.click(modal.forwardButton);
                    await waitFor(() => expect(modal.element.maybe).toBeNull());
                });
            });
        });
    }
});


const modal = {
    get closeButton() {
        return this.__getByIdWithin('teacher-modal-close');
    },
    get forwardButton() {
        return this.__getByIdWithin('teacher-modal-forward');
    },
    get body() {
        return this.__getByIdWithin('modal-body');
    },
    get pages() {
        return this.__getByIdWithin('teacher-modal-pages');
    },
    get image() {
        return this.__getByIdWithin('teacher-modal-image');
    },
    get element() {
        const testId = 'active-modal'; 
        return ({
            get surely() {
                return screen.getByTestId(testId);
            },
            get maybe() {
                return screen.queryByTestId(testId);
            }
        });
    },
    __getByIdWithin(testId: string) {
        return within(this.element.surely).getByTestId(testId);
    }
};