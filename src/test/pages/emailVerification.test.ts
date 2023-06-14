import {screen, waitFor, within} from "@testing-library/react";
import {followHeaderNavLink, renderTestEnvironment} from "../utils";
import {rest} from "msw";
import {API_PATH, isPhy} from "../../app/services";
import {handlerThatReturns} from "../../mocks/handlers";
import {buildMockEvent, mockUser} from "../../mocks/data";
import userEvent from "@testing-library/user-event";

// TODO the below should be moved into a separate event test file once other event tests are added
describe("EventBookingForm", () => {
    isPhy && it("allows the current user to request a verification email", async () => {
        const mockEvent = buildMockEvent("test-event", "OPEN");
        const emailVerificationRequestHandler = handlerThatReturns();
        renderTestEnvironment({
            modifyUser: (user) => ({...user, emailVerificationStatus: "NOT_VERIFIED", role: "STUDENT"}),
            extraEndpoints: [
                rest.get(API_PATH + `/events`, handlerThatReturns({data: {results: [mockEvent], totalResults: 0}})),
                rest.get(API_PATH + `/events/test-event`, handlerThatReturns({data: mockEvent})),
                rest.post(API_PATH + `/users/verifyemail`, emailVerificationRequestHandler)
            ]
        });
        await followHeaderNavLink("Events", "All Events");
        // Get all event cards
        const eventCards = await screen.findAllByTestId("event-card");
        // Click on the event card for the given mock event
        const eventCard = eventCards.find((card) => {
            const title = within(card).queryByText(mockEvent.title as string);
            return title !== null;
        });
        expect(eventCard).toBeDefined();
        const detailsButton = await within(eventCard as HTMLElement).findByRole("link", {name: /^View details/});
        await userEvent.click(detailsButton);
        // Expect to see the event description
        await screen.findByText(mockEvent.children[0].value);
        const bookingFormButton = await screen.findByRole("button", {name: "Book a place"});
        await userEvent.click(bookingFormButton);
        // Expect to see the email verification prompt
        const requestVerificationEmailButton = await screen.findByRole("button", {name: "Verify your email before booking"});
        // Click the button to request a verification email
        await userEvent.click(requestVerificationEmailButton);
        await waitFor(async () => {
            await expect(emailVerificationRequestHandler).toHaveBeenRequestedWith(async (req) => {
                const {email} = await req.json();
                return email === mockUser.email;
            });
            // Look for success message
            await screen.findByText(`We have sent an email to ${mockUser.email}. Please follow the instructions in the email prior to booking.`);
        });
    });

    isPhy && it("does not allow the current user to request a verification email for someone else", async () => {
        const mockEvent = buildMockEvent("test-event", "OPEN");
        renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                rest.get(API_PATH + `/events/overview`, handlerThatReturns({data: {results: [mockEvent], totalResults: 0}})),
                rest.get(API_PATH + `/events/test-event`, handlerThatReturns({data: mockEvent})),
                rest.get(API_PATH + `/admin/users`, handlerThatReturns({data: [{...mockUser, id: mockUser.id + 1, email: "test@test.com", emailVerificationStatus: "NOT_VERIFIED"}]})),
            ]
        });
        await followHeaderNavLink("Admin", "Event Admin");
        // Get event manager row that contains the given mock event
        const eventManagerRows = await screen.findAllByTestId("event-manager-row");
        const eventManagerRow = eventManagerRows.find((row) => {
            const title = within(row).queryByText(`${mockEvent.title} - ${mockEvent.subtitle}`);
            return title !== null;
        });
        expect(eventManagerRow).toBeDefined();
        // Click manage button
        const manageButton = await within(eventManagerRow as HTMLElement).findByRole("button", {name: "Manage"});
        await userEvent.click(manageButton);
        // Click on the "Add users to booking" accordion
        const addUsersAccordion = await screen.findByRole("button", {name: /Add users to booking/});
        await userEvent.click(addUsersAccordion);
        // Fill the email input
        const emailInput = await screen.findByLabelText("Find a user by email:");
        await userEvent.type(emailInput, "test@test.com");
        // Click the "Find user" button
        const findUserButton = await screen.findByRole("button", {name: "Find user"});
        await userEvent.click(findUserButton);
        // Click the "Book a place" button
        const bookPlaceButton = await within(await screen.findByTestId("user-search-table")).findByRole("button", {name: "Book a place"});
        await userEvent.click(bookPlaceButton);
        // Expect to see warning about email verification
        await screen.findByText("WARNING: This email is not verified. The details about the event might not reach the user.");
        // Make sure the "Verify your email before booking" button is not present
        const verifiyButtonExists = await screen.findAllByRole("button", {name: "Verify your email before booking"})
            .then(() => true)
            .catch(() => false);
        expect(verifiyButtonExists).toBe(false);
    });
});