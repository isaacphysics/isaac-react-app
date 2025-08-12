import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { times } from "lodash";

import { isPhy, KEY, persistence } from "../../app/services";
import { type UserRole } from "../../IsaacApiTypes";
import { mockPersistence, mockRedirects } from "../../mocks/utils";
import { expectH1, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";

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
            describe('when showOnboardingModalOnNextOverviewVisit is unset', () => {
                it('does not appear', async() => {
                    await renderOverviewPage();
                    expect(modal.element).toBeNull();
                });
            });

            describe('when showOnboardingModalOnNextOverviewVisit is set', () => {
                mockPersistence(p => p.save(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT, "true"));
                
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

                    it('shows a "Next" button that takes to the following page', async () => {
                        await renderOverviewPage();
                        expect(modal.forwardButton).toHaveTextContent('Next');
                        userEvent.click(modal.forwardButton);
                        await waitFor(() => expect(modal.pages).toHaveTextContent('2 of 4'));
                    });

                    it('can be dismissed by closing the modal', async () => {
                        await renderOverviewPage();
                        userEvent.click(modal.closeButton);
                        await waitFor(() => expect(modal.element).toBeNull());
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

                    it('shows a "Go to My Ada" button that dismisses the modal', async () => {
                        await renderLastPage();
                        await waitFor(() => expect(modal.forwardButton).toHaveTextContent("Go to My Ada"));
                        userEvent.click(modal.forwardButton);
                        await waitFor(() => expect(modal.element).toBeNull());
                    });
                });

                it('unsets the flag when the modal is left open', async() => {
                    await renderOverviewPage();
                    await waitFor(() => expect(persistence.load(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT)).toBeNull());
                });

                it('leaves the flag when the modal is closed too quickly', async() => {
                    await renderOverviewPage();
                    userEvent.click(modal.closeButton);
                    waitFor(() => expect(modal.element).toBeNull());
                    expect(persistence.load(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT)).toBe("true");
                });
            });
        });
    }
});

const modal = {
    get closeButton() {
        return screen.getByRole('button', { name: "Close onboarding modal" });
    },
    get forwardButton() {
        return screen.getByRole('button', { name: "Go to next page on modal" });
    },
    get body() {
        return screen.getByRole('region', { name: 'Teacher onboarding modal page'});
    },
    get pages() {
        return screen.getByRole('region', { name: 'Modal page indicator' });
    },
    get image() {
        return screen.getByRole('presentation', { name: "Teacher onboarding modal image" });
    },
    get element() {
        return screen.queryByRole('dialog');
    }
};
