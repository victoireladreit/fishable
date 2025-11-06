import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
    HomeTab: undefined;
    History: undefined;
    Profile: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Home: NavigatorScreenParams<MainTabParamList>; // Onglets imbriqués
    NewSession: undefined;
    ActiveSession: { sessionId: string };
    SessionDetail: { sessionId: string };
    SessionSummary: { sessionId: string };
};
