import { NavigatorScreenParams } from '@react-navigation/native';
import { TabParamList } from './BottomTabNavigator';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined; // Ajout de l'écran
    Main: NavigatorScreenParams<TabParamList>;
    NewSession: undefined;
    ActiveSession: { sessionId: string };
    SessionSummary: { sessionId: string };
};
