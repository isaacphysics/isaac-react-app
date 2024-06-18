import { InterstitialCookieState } from '../state';
import { AppState, useAppSelector } from '../state';

interface UseUserConsentreturnType {
    cookieConsent: InterstitialCookieState;
    openAIConsent: boolean;
}

export function useUserConsent(): UseUserConsentreturnType {
    const { CONSENT: databaseRecordedConsent } = useAppSelector((state: AppState) => state?.userPreferences) || {};
    const cookieConsent = useAppSelector((state: AppState) => state?.cookieConsent ?? null);

    return {
        openAIConsent: !!databaseRecordedConsent?.OPENAI,
        cookieConsent
    };
}