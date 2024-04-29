import { screen } from "@testing-library/react";
import { Careers } from "../../app/components/pages/Careers";
import { renderTestEnvironment } from "../utils";
import careerVideos from "../../app/assets/career_videos.json";

const renderCareers = () => {
  renderTestEnvironment({
    PageComponent: Careers,
    initialRouteEntries: ["/careers_in_computer_science"],
  });
};

describe("Careers", () => {
  it("displays the page title correctly", () => {
    renderCareers();
    const pageTitle = screen.getByRole("heading", { name: "Careers in Computer Science" });
    expect(pageTitle).toBeInTheDocument();
  });

  it("shows the events section", () => {
    renderCareers();
    const eventsSection = screen.getByRole("heading", { name: "Events" });
    expect(eventsSection).toBeInTheDocument();
  });

  it.each(careerVideos)(
    "shows $title video, with correct speaker name, role, description and link to video",
    ({ id, video, title, description, name, job }) => {
      renderCareers();
      const careerVideo = screen.getByTitle(title);
      const speakerName = screen.getAllByTestId("video-speaker");
      const speakerRole = screen.getAllByTestId("speaker-role");
      const videoDescription = screen.getAllByTestId("video-description");
      expect(careerVideo).toBeInTheDocument();
      expect(careerVideo).toHaveAttribute(
        "src",
        `https://www.youtube-nocookie.com/embed/${video}?enablejsapi=1&fs=1&modestbranding=1`,
      );
      expect(speakerName[id - 1]).toHaveTextContent(name);
      expect(speakerRole[id - 1]).toHaveTextContent(job);
      const expectedText = description.trim();
      const receivedText = videoDescription[id - 1].textContent?.trim();
      expect(receivedText).toBe(expectedText);
    },
  );
});
