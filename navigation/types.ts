import { NavigatorScreenParams } from '@react-navigation/native';
import { TabParamList } from './BottomTabNavigator';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: NavigatorScreenParams<TabParamList>; // Paramètres pour le navigateur à onglets
    NewSession: undefined;
    ActiveSession: { sessionId: string };
    History: undefined; // Ajout de l'écran d'historique
    SessionDetail: { sessionId: string }; // Ajout de l'écran de détail (pour une future utilisation)
};
