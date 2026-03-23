import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import times from "lodash/times";

import { isPhy, KEY, persistence } from "../../app/services";
import { type UserRole } from "../../IsaacApiTypes";
import { mockPersistence } from "../../mocks/utils";
import { expectH1, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";

describe('Overview page', () => {
    if (isPhy) {
        it('has no such page', () => {});
    } else {
        mockPersistence();

        const renderOverviewPage = async (role: UserRole | "ANONYMOUS" = 'TEACHER') => {
            await renderTestEnvironment({ role, initalRouteEntries: ['/dashboard'] });
            await waitForLoaded();
            await setUrl({ pathname: '/dashboard' });
            await waitForLoaded();
        };

        const renderLastPage = async () => {
            await renderOverviewPage();
            await waitFor(() => expect(persistence.load(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT)).toBe("true"));
            await Promise.all(times(3, () => userEvent.click(modal.footerButtons[0])));
            await waitFor(() => expect(screen.getByTestId('active-modal-footer')).toBeInTheDocument(), { timeout: 2000 });
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
                beforeEach(() => {
                    persistence.save(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT, "false");
                });

                it('does not appear', async() => {
                    await renderOverviewPage();
                    expect(modal.element).toBeNull();
                });
            });

            describe('when showOnboardingModalOnNextOverviewVisit is set', () => {
                beforeEach(() => {
                    persistence.save(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT, "true");
                });

                describe('on the first page', () => {
                    it('shows the first page', async () => {
                        await renderOverviewPage();
                        expect(modal.pages.getAttribute('aria-valuenow')).toBe("1");
                    });

                    it('shows the text and picture for the first page', async () => {
                        await renderOverviewPage();
                        expect(modal.body).toHaveTextContent(/Welcome to Ada CS(\s)*Ada CS supports your teaching.*/);
                        expect(modal.image).toHaveAttribute('src', '/assets/cs/decor/onboarding-welcome.svg');
                    });

                    it('shows a "Next" button that takes to the following page', async () => {
                        await renderOverviewPage();
                        expect(modal.footerButtons[0]).toHaveTextContent('Next');
                        await userEvent.click(modal.footerButtons[0]);
                        await waitFor(() => expect(modal.pages.getAttribute('aria-valuenow')).toBe("2"));
                    });

                    it('can be dismissed by closing the modal', async () => {
                        await renderOverviewPage();
                        await userEvent.click(modal.closeButton);
                        await waitFor(() => expect(modal.element).toBeNull());
                    });

                    it('unsets the flag when the modal is closed', async () => {
                        await renderOverviewPage();
                        await userEvent.click(modal.closeButton);
                        await waitFor(() => expect(persistence.load(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT)).toBeNull());
                    });
                });

                describe('on the last page', () => {
                    beforeEach(() => {
                        persistence.save(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT, "true");
                    });

                    it('shows the last page', async () => {
                        await renderLastPage();
                        await waitFor(() => expect(modal.pages.getAttribute('aria-valuenow')).toBe(modal.pages.getAttribute('aria-valuemax')));
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
                        const goToMyAdaButton = modal.footerButtons[0];
                        await waitFor(() => expect(goToMyAdaButton).toHaveTextContent("Go to My Ada"));
                        await userEvent.click(goToMyAdaButton);
                        await waitFor(() => expect(modal.element).toBeNull());
                    });
                });
            });
        });
    }
});

const modal = {
    get closeButton() {
        return screen.getByRole('button', { name: "Close modal" });
    },
    get footerButtons() {
        return within(screen.getByTestId('active-modal-footer')).getAllByRole('button');
    },
    get body() {
        return screen.getByTestId('modal-page');
    },
    get pages() {
        return screen.getByTestId('modal-page-indicator');
    },
    get image() {
        return within(this.body).getByAltText('');
    },
    get element() {
        return screen.queryByRole('dialog');
    }
};
