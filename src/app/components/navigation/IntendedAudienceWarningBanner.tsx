import React from "react";
import { ContentBaseDTO } from "../../../IsaacApiTypes";
import { isIntendedAudience, notRelevantMessage, useUserContext } from "../../services";
import { selectors, useAppSelector } from "../../state";
import { RenderNothing } from "../elements/RenderNothing";
import { Alert } from "reactstrap";

export function IntendedAudienceWarningBanner({ doc }: { doc: ContentBaseDTO }) {
  const user = useAppSelector(selectors.user.orNull);
  const userContext = useUserContext();

  // If this page is intended for this user's context no need to show a warning banner
  if (isIntendedAudience(doc.audience, userContext, user)) {
    return RenderNothing;
  }

  return (
    <Alert color="warning" className={"no-print"}>
      <strong>Note: </strong>
      {`The content on this page has ${notRelevantMessage(
        userContext,
      )}. You can change your viewing preferences by updating your profile.`}
    </Alert>
  );
}
