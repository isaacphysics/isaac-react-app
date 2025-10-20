import { api } from "../../../../services";
import { showErrorToast, showSuccessToast } from "../../../../state/actions/popups";
import { useAppDispatch } from "../../../../state";

export const useReserveUsersOnCompetition = () => {
  const dispatch = useAppDispatch();

  const reserveUsersOnCompetition = async (
    eventId: string,
    userIds: number[],
    submissionLink: string,
    projectTitle: string,
    groupName?: string,
  ) => {
    try {
      await api.eventBookings.reserveUsersOnCompetition(
        eventId,
        userIds,
        submissionLink,
        groupName ?? "",
        projectTitle,
      );
      dispatch(
        showSuccessToast("Competition entry submitted", "You have successfully submitted your competition entry"),
      );
    } catch (error) {
      dispatch(showErrorToast("Competition Entry Failed", "Failed to make the competiton entry."));
    }
  };

  return reserveUsersOnCompetition;
};
