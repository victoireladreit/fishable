export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance en km
    return distance;
};

export const calculateTotalDistance = (route: { latitude: number; longitude: number }[]) => {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const p1 = route[i];
        const p2 = route[i + 1];
        totalDistance += calculateDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }
    return totalDistance;
};
