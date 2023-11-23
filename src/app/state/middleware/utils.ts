import { EmailVerificationStatus } from "../../../IsaacApiTypes";

export const MOST_RECENT_AUGUST = () => {
  const date = new Date();
  if (date.getMonth() < 7) {
    // Month is 0-indexed for some stupid reason
    date.setFullYear(date.getFullYear() - 1);
  }
  date.setMonth(7, 1);
  date.setHours(0, 0, 0, 0);
  // Date is now the 1st day of most recent August
  return date.getTime();
};

export const needToUpdateUserContextDetails = (lastConfirmedDate: EpochTimeStamp | undefined): boolean => {
  return !!lastConfirmedDate && lastConfirmedDate <= MOST_RECENT_AUGUST();
};

export const needToVerifyEmail = (
  teacherPending: boolean,
  emailVerificationStatus: EmailVerificationStatus,
): boolean => {
  return teacherPending && emailVerificationStatus !== "VERIFIED";
};
