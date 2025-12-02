import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FishingSessionsService, FishingSession } from '../../services';
import { Selector } from '../../components/common';
import { SessionMapPreview } from '../../components/common/SessionMapPreview'; // Import the new component
import { theme, colors } from '../../theme';
import { LocationVisibility, locationVisibilityOptions } from '../../lib/constants';

export const SessionPublicationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sessionId } = route.params as { sessionId: string };

  const [caption, setCaption] = useState('');
  const [locationVisibility, setLocationVisibility] = useState<LocationVisibility>('public');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSession, setIsFetchingSession] = useState(true);
  const [sessionData, setSessionData] = useState<FishingSession | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const session = await FishingSessionsService.getSessionById(sessionId);
        if (session) {
          setSessionData(session);
          setCaption(session.caption || '');
          if (session.location_visibility) {
            setLocationVisibility(session.location_visibility);
          }
        }
      } catch (error) {
        console.error('Failed to fetch session data:', error);
        Alert.alert('Erreur', 'Impossible de charger les données de la session.');
      } finally {
        setIsFetchingSession(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const handlePublish = async () => {
    if (!sessionId) {
      Alert.alert('Erreur', 'Aucun ID de session fourni.');
      return;
    }

    setIsLoading(true);
    try {
      await FishingSessionsService.updateSession(sessionId, {
        caption,
        location_visibility: locationVisibility,
        status: 'completed',
        published_at: new Date().toISOString(),
      });

      Alert.alert('Succès', 'Votre session a été publiée avec succès !');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to publish session:', error);
      Alert.alert('Erreur', 'La publication de la session a échoué. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const staticInfoText = `• Privée : La carte sera très dézoomée, sans détails précis du lieu.
  
• Région : La carte affichera une zone géographique assez précise de la session, sans le tracé exact.

• Publique : La carte affichera la zone précise de la session ET le tracé exact.`;

  if (isFetchingSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement de la session...</Text>
      </View>
    );
  }

  const sessionRoute = sessionData?.route ? (sessionData.route as unknown as { latitude: number; longitude: number }[]) : [];

  return (
    <View style={styles.container}>
        <View style={styles.mapContainer}>
            <SessionMapPreview
                sessionRoute={sessionRoute}
                locationLat={sessionData?.location_lat}
                locationLng={sessionData?.location_lng}
                aspectRatio={1} // Ensure it's square
                locationVisibility={locationVisibility} // Pass locationVisibility
            />
        </View>

      <TextInput
        style={styles.input}
        placeholder="Ajouter une légende..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      <Selector
        label="Visibilité de la localisation"
        options={locationVisibilityOptions}
        selectedValue={locationVisibility}
        onSelect={setLocationVisibility}
        info={staticInfoText}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
            style={[styles.buttonPrimary, isLoading && styles.buttonDisabled]}
            onPress={handlePublish}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Publier</Text>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.default,
  },
  input: {
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: theme.spacing[4],
  },
  buttonContainer: {
      marginTop: theme.spacing[4],
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  buttonPrimary: {
    backgroundColor: colors.primary["500"],
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: colors.gray["400"],
  },
  mapContainer: { // Added a container for the map preview
    marginBottom: theme.spacing[4],
  }
});
