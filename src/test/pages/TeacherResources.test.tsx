import userEvent from "@testing-library/user-event";
import { isPhy } from "../../app/services";
import { UserRole } from "../../IsaacApiTypes";
import { expectH1, renderTestEnvironment, setUrl } from "../testUtils";
import { screen, within } from "@testing-library/react";

describe('Teacher Resources page', () => {
    if (isPhy) {
        it('has no such page', () => {});
    } else {
        const renderTeacherResources = async (role: UserRole | "ANONYMOUS" = 'TEACHER') => {
            await renderTestEnvironment({ role });
            await setUrl({ pathname: '/teachers' });
        };

        it('shows the teacher resources page', async () => {
            await renderTeacherResources('TEACHER');
            expectH1('Ada CS for teachers');
        });

        describe('welcome section', () => {
            describe('when the user is not logged in', () => {
                it('shows a sign-up button', async () => {
                    await renderTeacherResources('ANONYMOUS');
                    expect(page.welcome.button).toHaveTextContent("Sign up to Ada CS");
                });

                it('opens the sign-up page when the button is clicked', async () => {
                    await renderTeacherResources('ANONYMOUS');
                    await userEvent.click(page.welcome.button);
                    expectH1('Create an Ada Computer Science account');
                });
            });

            describe('when a teacher is logged in', () => {
                it('shows a go to overview button', async () => {
                    await renderTeacherResources('TEACHER');
                    expect(page.welcome.button).toHaveTextContent("Go to My Ada Overview");
                });

                it('opens the overview page when the button is clicked', async () => {
                    await renderTeacherResources('TEACHER');
                    await userEvent.click(page.welcome.button);
                    expectH1("Overview");
                });
            });

            describe('when a student is logged in', () => {
                it('shows an upgrade button', async () => {
                    await renderTeacherResources('STUDENT');
                    expect(page.welcome.button).toHaveTextContent("Upgrade to a teacher account");
                });

                it('opens the upgrade page when the button is clicked', async () => {
                    await renderTeacherResources('STUDENT');
                    await userEvent.click(page.welcome.button);
                    expectH1("Upgrade to a teacher account");
                });
            });
        });

        describe('"tools to help you teach" section', () => {
            describe('when the user is not signed in', () => {
                it('shows just 2 buttons (sign-up, sign-in)', async () => {
                    await renderTeacherResources('ANONYMOUS');
                    expect(page.tools.buttons).toHaveLength(2);
                });

                it('shows an account creation button', async () => {
                    await renderTeacherResources('ANONYMOUS');
                    expect(page.tools.buttons[0]).toHaveTextContent("Create an account");
                });

                it('opens the sign-up page when the button is clicked', async () => {
                    await renderTeacherResources('ANONYMOUS');
                    await userEvent.click(page.tools.buttons[0]);
                    expectH1('Create an Ada Computer Science account');
                });

                it('shows a log-in button', async () => {
                    await renderTeacherResources('ANONYMOUS');
                    expect(page.tools.buttons[1]).toHaveTextContent("Log in");
                });
                
                it('opens the log-in page when the button is clicked', async () => {
                    await renderTeacherResources('ANONYMOUS');
                    await userEvent.click(page.tools.buttons[1]);
                    expect(logInPage.header).toBeInTheDocument();
                });
            });

            describe('when a teacher is logged in', () => {
                it('shows 5 buttons (overview + 4 tool links)', async () => {
                    await renderTeacherResources('TEACHER');
                    expect(page.tools.buttons).toHaveLength(5);
                });

                it('shows a go to overview button', async () => {
                    await renderTeacherResources('TEACHER');
                    expect(page.tools.buttons[0]).toHaveTextContent("Go to My Ada");
                });

                it('opens the overview page when the button is clicked', async () => {
                    await renderTeacherResources('TEACHER');
                    await userEvent.click(page.tools.buttons[0]);
                    expectH1("Overview");
                });
            });

            describe('when a student is logged in', () => {
                it('shows just 1 button', async () => {
                    await renderTeacherResources('STUDENT');
                    expect(page.tools.buttons).toHaveLength(1);
                });

                it('shows an upgrade button', async () => {
                    await renderTeacherResources('STUDENT');
                    expect(page.tools.buttons[0]).toHaveTextContent("Upgrade to a teacher account");
                });

                it('opens the upgrade page when the button is clicked', async () => {
                    await renderTeacherResources('STUDENT');
                    await userEvent.click(page.tools.buttons[0]);
                    expectH1("Upgrade to a teacher account");
                });
            });
        });
    }
});

const page = {
    get welcome() {
        const container = screen.getByRole('region', { name: /Ada CS for teachers/});
        return {
            get button() {
                return within(container).getByRole('link');
            }
        };
    },
    get tools() {
        const container = screen.getByRole('region', { name: /Tools to help you teach/});
        return {
            get buttons() {
                return within(container).getAllByRole('link');
            },
        };
    }
};

const logInPage = {
    get header() {
        return within(screen.getByTestId('main')).getByRole('heading', { level: 2 });
    }
};
