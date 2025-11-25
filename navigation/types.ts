import { NavigatorScreenParams } from '@react-navigation/native';

// Paramètres pour le StackNavigator du FishLog
export type FishLogStackParamList = {
    FishLogList: undefined; // L'écran de liste du FishLog (renommé)
    FishLogDetail: { speciesId: string }; // L'écran de détail d'une espèce
};

export type MainTabParamList = {
    HomeTab: undefined;
    Sessions: undefined;
    UserCatches: undefined;
    FishLog: NavigatorScreenParams<FishLogStackParamList>; // Le FishLog est maintenant un StackNavigator
    Profile: undefined;
};

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Home: NavigatorScreenParams<MainTabParamList>; // Onglets imbriqués
    Settings: undefined;
    NewSession: { onGoBack: () => void };
    ActiveSession: { sessionId: string; onGoBack: () => void; };
    SessionDetail: { sessionId: string; onGoBack?: (modified: boolean) => void };
    SessionSummary: { sessionId: string };
    AddCatch: { sessionId?: string; catchLocationLat?: number; catchLocationLng?: number; catchLocationAccuracy?: number; };
    EditCatch: { catchId: string };
};
