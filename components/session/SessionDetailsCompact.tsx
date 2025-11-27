import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Database } from '../../lib/types';

type FishingSession = Database['public']['Tables']['fishing_sessions']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type SessionPhoto = Database['public']['Tables']['session_photos']['Row'];
type Catch = Database['public']['Tables']['catches']['Row'];

interface FishingSessionWithProfile extends FishingSession {
    profiles: Profile;
    session_photos: SessionPhoto[];
    catches: Catch[];
}

interface SessionDetailsCompactProps {
    session: FishingSessionWithProfile;
}

// Helper for wind strength translation (copied from HomeScreen for self-containment)
const translateWindStrength = (strength: 'calm' | 'light' | 'moderate' | 'strong' | null) => {
    switch (strength) {
        case 'calm': return 'Calme';
        case 'light': return 'Léger';
        case 'moderate': return 'Modéré';
        case 'strong': return 'Fort';
        default: return 'Non spécifié';
    }
};

const formatDateWithYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const SessionDetailsCompact: React.FC<SessionDetailsCompactProps> = ({ session }) => {
    const displayLocation = (session.location_visibility !== 'private' && session.region) 
        ? session.region 
        : session.location_name || 'Non spécifié';
    
    return (
        <View style={styles.container}>
            {/* First Line: Location, Date, Duration */}
            <View style={styles.row}>
                {displayLocation !== 'Non spécifié' && (
                    <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={theme.iconSizes.sm} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText} numberOfLines={1}>{displayLocation}</Text>
                    </View>
                )}
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={theme.iconSizes.sm} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{formatDateWithYear(session.started_at)}</Text>
                </View>
                {session.duration_minutes && (
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={theme.iconSizes.sm} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>{session.duration_minutes} min</Text>
                    </View>
                )}
            </View>

            {/* Second Line: Weather (Temperature, Conditions, Wind) */}
            <View style={styles.row}>
                {session.weather_temp && (
                    <View style={styles.detailItem}>
                        <Ionicons name="thermometer-outline" size={theme.iconSizes.sm} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>{session.weather_temp}°C</Text>
                    </View>
                )}
                {session.weather_conditions && (
                    <View style={styles.detailItem}>
                        <Ionicons name="cloud-outline" size={theme.iconSizes.sm} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>{session.weather_conditions}</Text>
                    </View>
                )}
                {(session.wind_strength || session.wind_speed_kmh) && (
                    <View style={styles.detailItem}>
                        <Ionicons name="flag-outline" size={theme.iconSizes.sm} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>
                            {translateWindStrength(session.wind_strength)}
                            {session.wind_speed_kmh ? ` (${session.wind_speed_kmh} km/h)` : ''}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[2],
        backgroundColor: theme.colors.background.paper,
        borderRadius: theme.borderRadius.base,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        marginBottom: theme.spacing[4], // Keep margin bottom for separation from catches/buttons
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around', // Distribute items evenly
        marginBottom: theme.spacing[1], // Space between rows
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: theme.spacing[1], // Smaller horizontal margin for compactness
        marginVertical: theme.spacing[0], // No vertical margin within a row
    },
    detailText: {
        marginLeft: theme.spacing[1],
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        // maxWidth: 100, // This might be too restrictive, let's try without it first or adjust
    },
});
