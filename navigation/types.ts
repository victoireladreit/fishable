import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
    HomeTab: undefined;
    Sessions: undefined;
    Profile: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Home: NavigatorScreenParams<MainTabParamList>; // Onglets imbriqués
    NewSession: { onGoBack: () => void };
    ActiveSession: { sessionId: string; onGoBack: () => void; };
    SessionDetail: { sessionId: string; onGoBack?: (modified: boolean) => void };
    SessionSummary: { sessionId: string };
    AddCatch: { sessionId: string; catchLocationLat?: number; catchLocationLng?: number; catchLocationAccuracy?: number; };
    EditCatch: { catchId: string };
};
