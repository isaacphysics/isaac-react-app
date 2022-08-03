import React, {useEffect} from "react";
import {Tabs} from "./Tabs";
import {IsaacContent} from "../content/IsaacContent";
import {AppState, fetchFragment, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";

const COMPUTER_SCIENTIST_FRAGMENT_ID = "computer-scientist-of-the-month";

export function FeaturedContentTabs() {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(fetchFragment(COMPUTER_SCIENTIST_FRAGMENT_ID));}, [dispatch]);
    const computerScientist = useAppSelector((state: AppState) => state?.fragments && state.fragments[COMPUTER_SCIENTIST_FRAGMENT_ID]);

    return <div className="tabs-featured-question">
        {/* use tabOverride.current below for random tab on page refresh */}
        <Tabs tabContentClass="mt-3 mt-md-5" activeTabOverride={1}>
            {{
                "Computer Science Journeys": <ShowLoading
                    until={computerScientist}
                    thenRender={(cserOfTheMonth) => {
                        return <div className="computer-scientist-of-the-month mt-4 mb-md-5">
                            <IsaacContent doc={cserOfTheMonth} />
                        </div>
                    }}
                    ifNotFound={<div className="computer-scientist-of-the-month mt-4 mb-5 text-center">
                        Unfortunately, we don't currently have a Computer Science Journey to display.<br />
                        Please check back later!
                    </div>}
                />,
            }}
        </Tabs>
    </div>
}
