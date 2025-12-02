import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FishingSessionsService } from '../../services';
import { Selector } from '../../components/common';
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

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const session = await FishingSessionsService.getSessionById(sessionId);
        if (session) {
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

  // Formatted static info text for location visibility
  const staticInfoText = `• Privé : Seuls vous pouvez voir le lieu exact.

• Région : Les autres utilisateurs ne verront que la région ou la ville (ex: Paris, Île-de-France).

• Public : Le lieu ou le parcours exact sera visible par tous.`;

  if (isFetchingSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement de la session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        info={staticInfoText} // Pass the formatted static info text
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
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
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
});
