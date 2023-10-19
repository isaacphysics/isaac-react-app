import React from "react";
import { Tabs } from "./Tabs";
import { IsaacContent } from "../content/IsaacContent";
import { ShowLoading } from "../handlers/ShowLoading";
import { isaacApi, resultOrNotFound } from "../../state";

const COMPUTER_SCIENTIST_FRAGMENT_ID = "computer-scientist-of-the-month";

export function FeaturedContentTabs() {
  const { data: fragment, error } = isaacApi.endpoints.getPageFragment.useQuery(COMPUTER_SCIENTIST_FRAGMENT_ID);

  return (
    <div className="tabs-featured-question">
      {/* use tabOverride.current below for random tab on page refresh */}
      <Tabs tabContentClass="mt-3 mt-md-5" activeTabOverride={1}>
        {{
          "Computer Science Journeys": (
            <ShowLoading
              until={resultOrNotFound(fragment, error)}
              thenRender={(cserOfTheMonth) => {
                return (
                  <div className="computer-scientist-of-the-month mt-4 mb-md-5">
                    <IsaacContent doc={cserOfTheMonth} />
                  </div>
                );
              }}
              ifNotFound={
                <div className="computer-scientist-of-the-month mt-4 mb-5 text-center">
                  Unfortunately, we don't currently have a Computer Science Journey to display.
                  <br />
                  Please check back later!
                </div>
              }
            />
          ),
        }}
      </Tabs>
    </div>
  );
}
