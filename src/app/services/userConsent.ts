import { InterstitialCookieState } from '../state';
import { AppState, useAppSelector } from '../state';

interface UseUserConsentReturnType {
    cookieConsent: InterstitialCookieState;
    openAIConsent: boolean;
}

export function useUserConsent(): UseUserConsentReturnType {
    const { CONSENT: databaseRecordedConsent } = useAppSelector((state: AppState) => state?.userPreferences) || {};
    const cookieConsent = useAppSelector((state: AppState) => state?.cookieConsent ?? null);

    return {
        openAIConsent: !!databaseRecordedConsent?.OPENAI,
        cookieConsent
    };
}