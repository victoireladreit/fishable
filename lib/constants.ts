export type WindStrength = 'calm' | 'light' | 'moderate' | 'strong';
export type WaterLevel = 'normal' | 'high' | 'flood';
export type LocationVisibility = 'public' | 'region' | 'private';

export const windStrengthOptions: { key: WindStrength; label: string }[] = [
    { key: 'calm', label: 'Calme' },
    { key: 'light', label: 'Léger' },
    { key: 'moderate', label: 'Modéré' },
    { key: 'strong', label: 'Fort' },
];

export const locationVisibilityOptions: { key: LocationVisibility; label: string; description: string }[] = [
    { key: 'private', label: 'Privée', description: 'Seuls vous pouvez voir le lieu exact.' },
    { key: 'region', label: 'Région', description: 'Les autres utilisateurs ne verront que la région ou la ville' },
    { key: 'public', label: 'Public', description: 'Le lieu ou le parcours exact sera visible par tous.' },
];

export const waterLevelOptions: { key: WaterLevel; label: string }[] = [
    { key: 'normal', label: 'Normal' },
    { key: 'high', label: 'Haut' },
    { key: 'flood', label: 'Crue' },
];
