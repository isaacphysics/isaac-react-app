import React from "react";
import { Col } from "reactstrap";
import CompetitionButton from "../Buttons/CompetitionButton";
import {
  isBeforeCompetitionOpenDate,
  isAfterCompetitionOpenDateAndBeforeCompetitionEndDate,
  isAfterCompetitionEndDateAndBeforeEntriesClosedBannerEndDate,
} from "../dateUtils";

const HomepageHighlight = () => {
  const currentDate = new Date();

  const getBannerContent = () => {
    if (isBeforeCompetitionOpenDate(currentDate)) {
      return {
        title: "National Computer Science Competition 2025/26",
        subtitle: "Opening November 2025",
        button: {
          to: "https://forms.office.com/e/23bsQuZfjm",
          label: "Be the first one to know",
        },
      };
    } else if (isAfterCompetitionOpenDateAndBeforeCompetitionEndDate(currentDate)) {
      return {
        title: "Entries are now open",
        subtitle: "National Computer Science Competition 2025/26",
        button: {
          to: "/national-computer-science-competition",
          label: "Enter the competition",
        },
        titleBelowSubtitle: true, // Special flag for this case
      };
    } else if (isAfterCompetitionEndDateAndBeforeEntriesClosedBannerEndDate(currentDate)) {
      return {
        title: "National Computer Science Competition 2025/26",
        subtitle1: "Entries for this competition have now closed.",
        subtitle2: "The finalists will be announced in March 2026",
        button: null,
        isClosedState: true, // Special flag for closed state styling
      };
    }
    return null;
  };

  const renderBannerContent = (bannerContent: NonNullable<ReturnType<typeof getBannerContent>>) => {
    if (bannerContent.titleBelowSubtitle) {
      return (
        <>
          <h1 className="homepage-highlight-sub-title px-4 pt-4 pb-2">{bannerContent.subtitle}</h1>
          <h1 className="homepage-highlight-title px-4">{bannerContent.title}</h1>
        </>
      );
    }

    if (bannerContent.isClosedState) {
      return (
        <>
          <h1 className="homepage-highlight-title pb-3 pt-4">{bannerContent.title}</h1>
          <h1 className="homepage-highlight-sub-title px-2 ">{bannerContent.subtitle1}</h1>
          <h1 className="homepage-highlight-sub-title px-2  pb-4">{bannerContent.subtitle2}</h1>
        </>
      );
    }

    return (
      <>
        <h1 className="homepage-highlight-title px-1 pt-4">{bannerContent.title}</h1>
        <h1 className="homepage-highlight-sub-title p-2">{bannerContent.subtitle}</h1>
      </>
    );
  };

  const bannerContent = getBannerContent();

  if (!bannerContent) return null;

  return (
    <Col xs={12} className="pt-2 pb-5">
      <div
        className={`homepage-highlight rounded justify-content-center ${
          bannerContent.isClosedState ? "closed-state" : ""
        }`}
      >
        <div className="text-center">{renderBannerContent(bannerContent)}</div>
        {bannerContent.button && (
          <div className="pb-4 text-center d-flex justify-content-center">
            <CompetitionButton buttons={[bannerContent.button]} />
          </div>
        )}
      </div>
    </Col>
  );
};

export default HomepageHighlight;
