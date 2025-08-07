import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { isPhy } from "../../app/services";
import { expectH1, renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";
import { mockRedirects } from "../../mocks/utils";


describe('Overview page', () => {
    if (isPhy) {
        it('has no such page', () => {});
    } else {
        mockRedirects();
        
        const renderOverviewPage = async () => {
            renderTestEnvironment({ role: 'TEACHER'});
            await waitForLoaded();
            act(() => setUrl({ pathname: '/dashboard' }));
            await waitFor(() => expect(closeButton()).toBeInTheDocument());
        };

        it('shows the heading', async () => {
            await renderOverviewPage(); 
            userEvent.click(closeButton());
            expectH1('Overview');
        });

        describe('Teacher onboarding modal', () => {
            describe('initially', () => {
                it('shows pages', async () => {
                    await renderOverviewPage();
                    expect(pages()).toHaveTextContent('1 of 4');
                });
            });
        });
    }
});

const closeButton = () => screen.getByTestId('teacher-modal-close');
const pages = () => screen.getByTestId('teacher-modal-pages');