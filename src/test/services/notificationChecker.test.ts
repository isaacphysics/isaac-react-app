import { KEY, persistence, showNotification } from "../../app/services";
import { mockUser } from "../../mocks/data";

const currentTime = new Date().getTime();

const moreThan14DaysAgo = currentTime - 15 * 24 * 60 * 60 * 1000;
const lessThan14DaysAgo = currentTime - 2 * 24 * 60 * 60 * 1000;

const lastSeenNotificationMoreThan24hAgo = new Date(currentTime - 2 * 24 * 60 * 60 * 1000).toString();
const lastSeenNotificationLessThan24hAgo = new Date(currentTime - 2 * 60 * 60 * 1000).toString();

describe("showNotifications check", () => {
  it("returns true if user registered more than 14 days ago and hasn't seen notifications in last 24h", async () => {
    persistence.save(KEY.LAST_NOTIFICATION_TIME, lastSeenNotificationMoreThan24hAgo);
    expect(showNotification({ ...mockUser, registrationDate: moreThan14DaysAgo })).toBe(true);
  });

  it("returns true if user registered more than 14 days ago and has never seen the notification", async () => {
    persistence.remove(KEY.LAST_NOTIFICATION_TIME);
    expect(showNotification({ ...mockUser, registrationDate: moreThan14DaysAgo })).toBe(true);
  });

  it("returns false if user registered more than 14 days ago, but saw the notification in last 24h", async () => {
    persistence.save(KEY.LAST_NOTIFICATION_TIME, lastSeenNotificationLessThan24hAgo);
    expect(showNotification({ ...mockUser, registrationDate: moreThan14DaysAgo })).toBe(false);
  });

  it("returns false if user registered less than 14 days ago", async () => {
    expect(showNotification({ ...mockUser, registrationDate: lessThan14DaysAgo })).toBe(false);
  });
});
