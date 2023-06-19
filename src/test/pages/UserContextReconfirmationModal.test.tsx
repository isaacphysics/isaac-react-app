import { screen } from "@testing-library/react";
import { MOST_RECENT_AUGUST } from "../../app/state";
import produce from "immer";
import { renderTestEnvironment } from "../utils";

describe("UserContextReconfirmationModal", () => {
  it("should not show if the user has recently updated their audience context information", async () => {
    renderTestEnvironment();
    // Wait for main content to be loaded
    await screen.findByTestId("main");
    // Check for modals
    const modals = screen.queryAllByTestId("active-modal");
    if (modals.length > 0) {
      // If there is another modal, it shouldn't be the audience context update one
      expect(modals[0]).not.toHaveModalTitle("Are your details up to date?");
      // There should only be one modal on the screen at a time
      expect(modals).toHaveLength(1);
    } else {
      expect(modals).toHaveLength(0);
    }
  });

  it("should show if the user has not updated their audience context information since last August", async () => {
    renderTestEnvironment({
      modifyUser: (user) =>
        produce(user, (u) => {
          u.registeredContextsLastConfirmed =
            MOST_RECENT_AUGUST().valueOf() - 10000000;
        }),
    });
    const modal = await screen.findByTestId("active-modal");
    expect(modal).toHaveModalTitle("Are your details up to date?");
  });

  it("should only show GCSE or A Level as stage options for a student", async () => {
    renderTestEnvironment({
      role: "STUDENT",
      modifyUser: (user) =>
        produce(user, (u) => {
          u.registeredContextsLastConfirmed =
            MOST_RECENT_AUGUST().valueOf() - 10000000;
        })});
    // wait for modal content to be loaded    
    await screen.findByTestId("active-modal");
    // find stage dropdown
    const combobox = screen.getByRole('combobox', {
        name: /stage/i 
      });
    // Get all option elements within the stage dropdown
    const options = Array.from(combobox.getElementsByTagName('option'));
    // Check that the options with values "gcse" and "a_level" exist
    const gcseOption = options.find(option => option.value === 'gcse');
    const aLevelOption = options.find(option => option.value === 'a_level');
    const allOption = options.find(option => option.value === 'all');
    expect(gcseOption).not.toBeNull();
    expect(aLevelOption).not.toBeNull();
    expect(allOption).toBeUndefined();
  });

  it("shows All Stages as a stage options for a teacher", async () => {
    renderTestEnvironment({
      role: "TEACHER",
      modifyUser: (user) =>
        produce(user, (u) => {
          u.registeredContextsLastConfirmed =
            MOST_RECENT_AUGUST().valueOf() - 10000000;
        })});
    // wait for modal content to be loaded    
    await screen.findByTestId("active-modal");
    // find stage dropdown
    const combobox = screen.getByRole('combobox', {
        name: /stage/i 
      });
    // Get all option elements within the stage dropdown and check that the option with value "all" exists
    const options = Array.from(combobox.getElementsByTagName('option'));
    const allOption = options.find(option => option.value === 'all');
    expect(allOption).not.toBeNull();
  });
});
