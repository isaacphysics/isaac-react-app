import { isPhy } from "../../app/services";
import { UserRole } from "../../IsaacApiTypes";
import { renderTestEnvironment, setUrl, waitForLoaded } from "../testUtils";
import {act, screen, waitFor, within} from "@testing-library/react";

describe('Navigation', () => {
    if (isPhy) {
        const renderHomepage = async (role : UserRole | 'ANONYMOUS' = 'ANONYMOUS') => {
            await renderTestEnvironment({
                role,
                // extraEndpoints: [buildFunctionHandler('/pages/questions', ['randomSeed', 'startIndex'], questionsSearchResponse)]    
            });
            await waitForLoaded();    
            await setUrl({ pathname: '/' });
            await waitForLoaded();
        };

        const openMenu = async () => {
            const menuButton = await screen.findByTestId('nav-menu-toggle');
            act(() => {
                menuButton.click();
            });

            await waitFor(() => {
                const menu = screen.getByTestId('header-offcanvas');
                expect(menu).toBeInTheDocument();
                expect(menu).toHaveClass('show');
            });
        };

        const closeMenu = async () => {
            const menuQuery = screen.queryByTestId('header-offcanvas');
            expect(menuQuery).toBeInTheDocument();

            const menu = screen.getByTestId('header-offcanvas');
            const closeButton = await within(menu).findByTestId('nav-menu-toggle');
            act(() => {
                closeButton.click();
            });

            await waitFor(() => {
                const menu = screen.queryByTestId('header-offcanvas');
                expect(menu).toBeNull();
            });
        };

        describe('on mobile', () => {
            beforeAll(() => {
                global.innerWidth = 500;
                global.dispatchEvent(new Event('resize'));
            });

            afterAll(() => {
                global.innerWidth = 1024; // Jest default
                global.dispatchEvent(new Event('resize'));
            });

            it('should open the navigation menu when the menu button is clicked', async () => {
                await renderHomepage();
                await openMenu();
            });

            it.skip('should close the navigation menu when any top-level link is clicked', async () => {
                // this does not test any of the dropdowns / accordions!
                await renderHomepage();
                await openMenu();
                const menu = screen.getByTestId('header-offcanvas');

                const getLinks = (menu: HTMLElement) => {
                    return within(menu).getAllByRole('link');
                };

                const numLinks = getLinks(menu).length;
                await closeMenu();

                for (let i = 0; i < numLinks; i++) {
                    await setUrl({ pathname: '/' });
                    
                    await openMenu();
                    
                    act(() => {
                        const menu = screen.getByTestId('header-offcanvas');
                        const link = getLinks(menu)[i];
                        link.click();
                    });

                    await waitFor(() => {
                        const menu = screen.queryByTestId('header-offcanvas');
                        if (menu) {
                            const link = getLinks(menu)[i] as HTMLAnchorElement;
                            throw new Error(` >> Menu did not close when clicking link to "${link.href}". << `);
                        }
                    });
                }
            });

            it('should close the navigation menu when any dropdown item is clicked', async () => {
                // this only tests the first link in each dropdown, under the assumption that all links are generated identically.
                //  (this takes about a minute otherwise...)
                const openDropdowns = async () => {
                    const menu = screen.getByTestId('header-offcanvas');
                    const buttons = within(menu).queryAllByRole('button');
                    buttons?.forEach(button => {
                        if (button.classList.contains("accordion-button")) {
                            act(() => {button.click();});
                        }
                    });

                    await waitFor(() => {
                        buttons.forEach(button => {
                            expect(button.classList.contains("collapsed")).toBe(false);
                        });
                    });
                };

                const getButtons = () => {
                    const menu = screen.getByTestId('header-offcanvas');
                    return within(menu).queryAllByRole('button').filter(button => button.classList.contains("accordion-button"));
                };

                await renderHomepage("ADMIN");
                await openMenu();
                await openDropdowns();
                const numButtons = getButtons().length;
                await closeMenu();

                for (let i = 0; i < numButtons; i++) {
                    await setUrl({ pathname: '/' });
                    
                    await openMenu();
                    await openDropdowns();
                    
                    act(() => {
                        const button = getButtons()[i];
                        const link = within(button.parentElement?.parentElement as HTMLElement).getAllByRole('menuitem')[0];
                        link.click();
                    });

                    await waitFor(() => {
                        const menu = screen.queryByTestId('header-offcanvas');
                        expect(menu).toBeNull();
                    });
                }
            });
        });
    } else {
        // Jest needs each test.tsx file to contain at least one test. For Ada, until there is a test here, just add a skipped one.
        it.skip('', () => {});
    }
});
