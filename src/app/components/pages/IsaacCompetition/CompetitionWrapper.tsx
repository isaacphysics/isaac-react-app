import React from "react";
import { isWithinFourWeeksAfterEndDate, isAfterFourWeeksFromEndDate } from "../../pages/IsaacCompetition/dateUtils";

interface CompetitionWrapperProps {
  children: React.ReactNode;
  closedCompetitionContent?: React.ReactNode;
}

const CompetitionWrapper = ({ children, closedCompetitionContent }: CompetitionWrapperProps) => {
  const currentDate = new Date();

  if (isWithinFourWeeksAfterEndDate(currentDate)) {
    return <>{closedCompetitionContent}</>;
  }

  if (isAfterFourWeeksFromEndDate(currentDate)) {
    return null;
  }

  return <>{children}</>;
};

export default CompetitionWrapper;
