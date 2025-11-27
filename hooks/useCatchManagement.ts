import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';
import { CatchesService } from '../services';
import { RootStackParamList } from '../navigation/types';
import { Database } from '../lib/types';

type Catch = Database['public']['Tables']['catches']['Row'];
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useCatchManagement = (sessionId: string, setCatches: React.Dispatch<React.SetStateAction<Catch[]>>) => {
    const navigation = useNavigation<NavigationProp>();

    const handleAddCatch = (currentLocation?: { latitude: number; longitude: number; accuracy?: number } | null) => {
        navigation.navigate('AddCatch', { 
            sessionId, 
            catchLocationLat: currentLocation?.latitude,
            catchLocationLng: currentLocation?.longitude,
            catchLocationAccuracy: currentLocation?.accuracy,
        });
    };

    const handleCatchDetail = (catchId: string) => {
        navigation.navigate('CatchDetail', { catchId });
    };

    const handleDeleteCatch = (catchId: string) => {
        Alert.alert(
            "Supprimer la prise",
            "Êtes-vous sûr de vouloir supprimer cette prise ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await CatchesService.deleteCatch(catchId);
                            setCatches(prevCatches => prevCatches.filter(c => c.id !== catchId));
                        } catch (error) {
                            console.error("Erreur suppression de la prise:", error);
                            Alert.alert("Erreur", "Impossible de supprimer la prise.");
                        }
                    },
                },
            ]
        );
    };

    return { handleAddCatch, handleCatchDetail: handleCatchDetail, handleDeleteCatch };
};
