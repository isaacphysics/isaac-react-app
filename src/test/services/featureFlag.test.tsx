import { FeatureFlag, FeatureFlagProvider, FeatureFlagWrapper, useFeatureFlag } from "../../app/services/featureFlag";
import React, { ReactNode } from "react";
import { screen, waitFor } from "@testing-library/react";
import { renderTestEnvironment, renderTestHook, waitForLoaded } from "../testUtils";
import { http } from "msw/core/http";
import { API_PATH } from "../../app/services";
import { handlerThatReturns } from "../../mocks/handlers";

describe('Feature flag service', () => {
    const environmentHandler = (segueEnv: string) => handlerThatReturns({data: {segueEnvironment: segueEnv}, status: 200 });

    describe('FeatureFlagWrapper', () => {
        const renderWithFlagProvider = async (Component: ReactNode, { segueEnvironment }: { segueEnvironment: string }) => {
            await renderTestEnvironment({
                PageComponent: () => <FeatureFlagProvider>
                    {Component}
                </FeatureFlagProvider>,
                extraEndpoints: [
                    http.get(API_PATH + "/info/segue_environment", environmentHandler(segueEnvironment)),
                ]
            });
            await waitForLoaded();
        };

        describe('one-way interface', () => {
            it('shows its child when the flag condition is met', async () => {
                await renderWithFlagProvider(
                    <FeatureFlagWrapper flag={FeatureFlag.TEST_FEATURE}>
                        <>Test ON</>
                    </FeatureFlagWrapper>,
                    { segueEnvironment: "DEV" }
                );

                expect(screen.queryByText("Test ON")).toBeInTheDocument();
            });
        
            it('does not show the child when the flag condition is not met', async () => {
                await renderWithFlagProvider(
                    <FeatureFlagWrapper flag={FeatureFlag.TEST_FEATURE}>
                        <>Test ON</>
                    </FeatureFlagWrapper>,
                    { segueEnvironment: "PROD" }
                );

                expect(screen.queryByText("Test ON")).not.toBeInTheDocument();
            });
        });

        describe('two-way interface', () => {
            it('shows the onSet component when the flag condition is met', async () => {
                await renderWithFlagProvider(
                    <FeatureFlagWrapper 
                        flag={FeatureFlag.TEST_FEATURE}
                        onSet={<>Test ON</>}
                        onUnset={<>Test OFF</>}
                    />,
                    { segueEnvironment: "DEV" }
                );

                expect(await screen.findByText("Test ON")).toBeInTheDocument();
            });

            it('shows the onUnset component when the flag condition is not met', async () => {
                await renderWithFlagProvider(
                    <FeatureFlagWrapper 
                        flag={FeatureFlag.TEST_FEATURE}
                        onSet={<>Test ON</>}
                        onUnset={<>Test OFF</>}
                    />,
                    { segueEnvironment: "PROD" }
                );

                expect(await screen.findByText("Test OFF")).toBeInTheDocument();
            });
        });
    });

    describe('useFeatureFlag hook', () => {
        it('flag is enabled when the flag condition is met', async () => {
            const { result } = renderTestHook(
                () => useFeatureFlag(FeatureFlag.TEST_FEATURE),
                {
                    Wrapper: ({ children }: { children: React.ReactNode }) => <FeatureFlagProvider>{children}</FeatureFlagProvider>,
                    extraEndpoints: [
                        http.get(API_PATH + "/info/segue_environment", environmentHandler("DEV")),
                    ]
                }
            );

            await waitFor(() => expect(result.current).toBe(true));
        });

        it('flag is enabled when at least one of the flags are enabled', async () => {
            const { result } = renderTestHook(
                () => useFeatureFlag(["OTHER" as FeatureFlag, FeatureFlag.TEST_FEATURE]),
                {
                    Wrapper: ({ children }: { children: React.ReactNode }) => <FeatureFlagProvider>{children}</FeatureFlagProvider>,
                    extraEndpoints: [
                        http.get(API_PATH + "/info/segue_environment", environmentHandler("DEV")),
                    ]
                }
            );

            await waitFor(() => expect(result.current).toBe(true));
        });

        // couldn't reliably test the negative case with the current interface, as there's no way to 
        // tell whether it's saying the switch is off because it's still loading, or because 
        // loading has finished and we know it's disabled
    });
});
