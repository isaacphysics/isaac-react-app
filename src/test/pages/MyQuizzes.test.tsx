import userEvent from "@testing-library/user-event";
import { MyQuizzes } from "../../app/components/pages/quizzes/MyQuizzes";
import { isPhy, PATHS } from "../../app/services";
import { renderTestEnvironment, waitForLoaded } from "../testUtils";
import {screen, waitFor, within} from "@testing-library/react";

describe("My Tests", () => {

    const renderMyTests = async () => {
        await renderTestEnvironment({
            PageComponent: MyQuizzes,
            initalRouteEntries: [PATHS.MY_TESTS],
            extraEndpoints: [],
        });

        await waitForLoaded();
        await waitFor(() => {
            expect(screen.queryByText("No tests match your filters.")).not.toBeInTheDocument();
        });
    };

    const switchToPracticeTestsTab = async () => {
        const tabs = await screen.findByTestId("tab-navbar");
        const practiceTestsButton = await within(tabs).findByRole("button", {name: /Practice tests/i});
        practiceTestsButton.click();
    };

    it("starts on the Assigned Tests tab", async () => {
        await renderMyTests();
        const tabs = await screen.findByTestId("tab-navbar");
        const assignedTestsButton = await within(tabs).findByRole("button", {name: /Assigned tests/i});
        expect(assignedTestsButton.parentElement).toHaveClass("active");
    });

    it("tests that are assigned, incomplete, and before their due date appear on load", async () => {
        await renderMyTests();
        const tabs = await screen.findByTestId("active-tab-pane");
        const quizzes = await within(tabs).findByTestId("assigned-quizzes");
        expect(quizzes.children).toHaveLength(1);
        expect(quizzes).toHaveTextContent("Test Quiz Assignment 3");
    });

    it("tests that are assigned and completed appear when the Completed filter is selected", async () => {
        await renderMyTests();

        const tabs = await screen.findByTestId("active-tab-pane");

        if (isPhy) {
            const completedFilter = await screen.findByLabelText("Complete");
            completedFilter.click();
        } else {
            const filtersMenu = await within(tabs).findByTestId("filter-dropdown");
            filtersMenu.click();
            const statusDropdown = await within(tabs).findByLabelText(/Filter by status/g);
            await userEvent.click(statusDropdown);
            await userEvent.click(screen.getByRole("option", {name: "Complete"}));
        }
        
        const quizzes = await within(tabs).findByTestId("assigned-quizzes");
        expect(quizzes.children).toHaveLength(3);
        expect(quizzes).toHaveTextContent("Test Quiz Assignment 1");
        expect(quizzes).toHaveTextContent("Test Quiz Assignment 2");
        expect(quizzes).toHaveTextContent("Test Quiz Assignment 3");
    });

    it("practice tests appear in the Practice Tests tab", async () => {
        await renderMyTests();
        await switchToPracticeTestsTab();
        
        const tabs = await screen.findByTestId("active-tab-pane");
        const quizzes = await within(tabs).findByTestId("practice-quizzes");

        expect(quizzes.children).toHaveLength(1);
        expect(quizzes).toHaveTextContent("Practice Quiz 1");
    });

    it("practice tests that are completed appear when the Completed filter is selected", async () => {
        await renderMyTests();
        await switchToPracticeTestsTab();

        const tabs = await screen.findByTestId("active-tab-pane");

        if (isPhy) {
            const completedFilter = await screen.findByLabelText("Complete");
            completedFilter.click();
        } else {
            const filtersMenu = await within(tabs).findByTestId("filter-dropdown");
            filtersMenu.click();
            const statusDropdown = await within(tabs).findByLabelText(/Filter by status/g);
            await userEvent.click(statusDropdown);
            await userEvent.click(screen.getByRole("option", {name: "Complete"}));
        }
        
        const quizzes = await within(tabs).findByTestId("practice-quizzes");

        expect(quizzes.children).toHaveLength(2);
        expect(quizzes).toHaveTextContent("Practice Quiz 1");
        expect(quizzes).toHaveTextContent("Practice Quiz 2");
    });
});
