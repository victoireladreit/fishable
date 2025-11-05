import { NavigatorScreenParams } from '@react-navigation/native';

// Définition des écrans de la barre d'onglets
export type MainTabParamList = {
    HomeTab: undefined;
    History: undefined;
    Profile: undefined;
    Settings: undefined;
};

// Définition de tous les écrans de l'application
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Home: NavigatorScreenParams<MainTabParamList>; // Onglets imbriqués
    NewSession: undefined;
    ActiveSession: { sessionId: string };
    SessionSummary: { sessionId: string };
};
