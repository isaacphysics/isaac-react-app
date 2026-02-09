import { FeatureFlag, FeatureFlagWrapper, useFeatureFlag } from "../../app/services/featureFlag";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { renderTestEnvironment, renderTestHook, waitForLoaded } from "../testUtils";
import { http } from "msw/core/http";
import { API_PATH } from "../../app/services";
import { HttpResponse } from "msw";

describe('Feature flag service', () => {
    const setEnviornment = (segueEnvironment: string) => [
        http.get(API_PATH + "/info/segue_environment", () => {
            return HttpResponse.json({segueEnvironment}, { status: 200 });
        }),
    ];

    describe('FeatureFlagWrapper', () => {
        const render =  async <P,> (
            Component: React.FC<P>,
            { segueEnvironment } : { segueEnvironment: "DEV" | "PROD"}
        ) => {
            await renderTestEnvironment({
                PageComponent: Component,
                initalRouteEntries: ['/some_path'],
                extraEndpoints: setEnviornment(segueEnvironment)
            });
            await waitForLoaded();
        };

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

    describe('useFeatureFlag hook', () => {
        it('flag is enabled when the flag condition is met', async () => {
            const { result } = renderTestHook(() => useFeatureFlag(FeatureFlag.TEST_FEATURE), {
                extraEndpoints: setEnviornment("DEV")
            });
            await waitFor(() => expect(result.current).toBe(true));
        });

        it('flag is enabled when at least one of the flags is enabled', async () => {
            const { result } = renderTestHook(() => useFeatureFlag(["OTHER" as FeatureFlag, FeatureFlag.TEST_FEATURE]), {
                extraEndpoints: setEnviornment("DEV")
            });
            await waitFor(() => expect(result.current).toBe(true));
        });

        // couldn't reliably test the negative case with the current interface, as there's no way to 
        // tell whether it's saying the switch is off because it's still loading, or because 
        // loading has finished and we know it's disabled
    });
});
