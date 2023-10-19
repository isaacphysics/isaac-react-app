import React from "react";
import { RegisteredUserDTO } from "../../../IsaacApiTypes";
import { useParams } from "react-router-dom";
import { Loading } from "./IsaacSpinner";
import { Redirect } from "react-router";
import { TrackedRoute } from "../navigation/TrackedRoute";
import { PotentialUser } from "../../../IsaacAppTypes";
import { Immutable } from "immer";

interface ExternalRedirectBaseProps {
  from: string;
}
type ExternalRedirectProps<Params extends { [K in keyof Params]: string }> = ExternalRedirectBaseProps &
  (
    | {
        to: (routeParams: Params) => `https://${string}` | undefined | null;
        ifUser?: never;
      }
    | {
        to: (routeParams: Params, user: Immutable<RegisteredUserDTO>) => `https://${string}` | undefined | null;
        ifUser: (user: Immutable<PotentialUser>) => boolean;
      }
  );
export function ExternalRedirect<Params extends { [K in keyof Params]: string } = object>({
  from,
  to,
  ifUser,
}: ExternalRedirectProps<Params>) {
  const ExternalRedirectInner = ({ user }: { user: Immutable<RegisteredUserDTO> }) => {
    const params = useParams<Params>();
    const redirectURL = ifUser ? to(params, user) : to(params);
    if (redirectURL) {
      window.location.replace(redirectURL);
      return <Loading />;
    }
    // Redirect to home page if the `redirectURL` cannot be built
    console.error("Problem building external redirect URL, redirecting to homepage...");
    return <Redirect to={"/"} />;
  };
  return <TrackedRoute exact ifUser={ifUser} path={from} component={ExternalRedirectInner} />;
}
