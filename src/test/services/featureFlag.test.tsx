import { FeatureFlag, FeatureFlagWrapper } from "../../app/services/featureFlag";
import React from "react";
import { screen } from "@testing-library/react";
import { renderTestEnvironment, waitForLoaded } from "../testUtils";
import { http } from "msw/core/http";
import { API_PATH } from "../../app/services";
import { HttpResponse } from "msw";

describe('Feature flag service', () => {
    const render =  async <P,> (
        Component: React.FC<P>,
        { segueEnvironment } : { segueEnvironment: "DEV" | "PROD"}
    ) => {
        await renderTestEnvironment({
            PageComponent: Component,
            initalRouteEntries: ['/some_path'],
            extraEndpoints: [
                http.get(API_PATH + "/info/segue_environment", () => {
                    return HttpResponse.json({segueEnvironment}, { status: 200, });
                }),
            ]
        });
        await waitForLoaded();
    };

    describe('FeatureFlagWrapper', () => {
        describe('one-way interface', () => {
            const WhenTestOn = () => <div> Test ON</div>;

            it('shows its child when the flag condition is met', async () => {
                await render(() => <FeatureFlagWrapper flag={FeatureFlag.TEST_FEATURE}>
                    <WhenTestOn/>
                </FeatureFlagWrapper>, { segueEnvironment: "DEV" }
                );

                expect(screen.queryByText("Test ON")).toBeInTheDocument();
            });
        
            it('does not show the child when the flag condition is not met', async () => {
                await render(() => <FeatureFlagWrapper flag={FeatureFlag.TEST_FEATURE}>
                    <WhenTestOn/>
                </FeatureFlagWrapper>, { segueEnvironment: "PROD" }
                );

                expect(screen.queryByText("Test ON")).not.toBeInTheDocument();
            });
        });

        describe('two-way interface', () => {
            it('shows the onSet component when the flag condition is met', async () => {
                await render(() => <FeatureFlagWrapper flag={FeatureFlag.TEST_FEATURE}
                    onSet={<>Test ON</>}
                    onUnset={<>Test OFF</>}
                />, { segueEnvironment: "DEV" }
                );

                expect(await screen.findByText("Test ON")).toBeInTheDocument();
            });

            it('shows the onUnset component when the flag condition is not met', async () => {
                await render(() => <FeatureFlagWrapper flag={FeatureFlag.TEST_FEATURE}
                    onSet={<>Test ON</>}
                    onUnset={<>Test OFF</>}
                />, { segueEnvironment: "PROD" }
                );

                expect(await screen.findByText("Test OFF")).toBeInTheDocument();
            });
        });
    });
});