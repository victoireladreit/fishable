export type WindStrength = 'calm' | 'light' | 'moderate' | 'strong';
export type WaterLevel = 'normal' | 'high' | 'flood';
export type LocationVisibility = 'public' | 'region' | 'private';

export const windStrengthOptions: { key: WindStrength; label: string }[] = [
    { key: 'calm', label: 'Calme' },
    { key: 'light', label: 'Léger' },
    { key: 'moderate', label: 'Modéré' },
    { key: 'strong', label: 'Fort' },
];

export const locationVisibilityOptions: { key: LocationVisibility; label: string}[] = [
    { key: 'private', label: 'Privée' },
    { key: 'region', label: 'Région' },
    { key: 'public', label: 'Publique' },
];

export const waterLevelOptions: { key: WaterLevel; label: string }[] = [
    { key: 'normal', label: 'Normal' },
    { key: 'high', label: 'Haut' },
    { key: 'flood', label: 'Crue' },
];
