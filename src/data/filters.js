import landmarks from './landmarks.json';

// Extract unique values for filters
export const zones = [...new Set(landmarks.map(l => l.zone))].sort();
export const types = [...new Set(landmarks.map(l => l.type))].sort();
export const significances = [...new Set(landmarks.map(l => l.significance))].sort();
export const states = [...new Set(landmarks.map(l => l.state))].sort();
export const bestTimes = [...new Set(landmarks.map(l => l.bestTimeToVisit))].sort();

// Zone color mapping
export const zoneColors = {
  North: { color: '#3b82f6', rgb: '59, 130, 246' },
  South: { color: '#22c55e', rgb: '34, 197, 94' },
  East: { color: '#f59e0b', rgb: '245, 158, 11' },
  West: { color: '#ec4899', rgb: '236, 72, 153' },
  Central: { color: '#a855f7', rgb: '168, 85, 247' },
};

// Filter landmarks
export function filterLandmarks(data, filters) {
  return data.filter(item => {
    if (filters.zone && filters.zone !== 'All' && item.zone !== filters.zone) return false;
    if (filters.type && filters.type !== 'All' && item.type !== filters.type) return false;
    if (filters.significance && filters.significance !== 'All' && item.significance !== filters.significance) return false;
    if (filters.state && filters.state !== 'All' && item.state !== filters.state) return false;
    if (filters.dslrAllowed !== undefined && filters.dslrAllowed !== null && item.dslrAllowed !== filters.dslrAllowed) return false;
    if (filters.bestTime && filters.bestTime !== 'All' && item.bestTimeToVisit !== filters.bestTime) return false;
    if (filters.maxFee !== undefined && filters.maxFee !== null && item.entranceFee > filters.maxFee) return false;
    if (filters.minRating && item.googleRating < filters.minRating) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

// Sort landmarks
export function sortLandmarks(data, sortBy, sortOrder = 'desc') {
  const sorted = [...data].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'rating':
        aVal = a.googleRating;
        bVal = b.googleRating;
        break;
      case 'fee':
        aVal = a.entranceFee;
        bVal = b.entranceFee;
        break;
      case 'time':
        aVal = a.timeNeeded;
        bVal = b.timeNeeded;
        break;
      case 'reviews':
        aVal = a.reviewsInLakhs;
        bVal = b.reviewsInLakhs;
        break;
      case 'name':
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      default:
        aVal = a.googleRating;
        bVal = b.googleRating;
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });
  return sorted;
}

// Search landmarks
export function searchLandmarks(data, query) {
  if (!query || query.trim() === '') return data;
  const q = query.toLowerCase().trim();
  return data.filter(
    item =>
      item.name.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.significance.toLowerCase().includes(q)
  );
}

// Get landmark by ID
export function getLandmarkById(id) {
  return landmarks.find(l => l.id === parseInt(id));
}

// Get related landmarks (same zone + type or same state)
export function getRelatedLandmarks(landmark, limit = 6) {
  return landmarks
    .filter(l => l.id !== landmark.id && (l.zone === landmark.zone || l.type === landmark.type || l.state === landmark.state))
    .sort((a, b) => b.googleRating - a.googleRating)
    .slice(0, limit);
}

// Stats
export function getStats() {
  return {
    totalLandmarks: landmarks.length,
    totalStates: new Set(landmarks.map(l => l.state)).size,
    totalZones: new Set(landmarks.map(l => l.zone)).size,
    avgRating: (landmarks.reduce((sum, l) => sum + l.googleRating, 0) / landmarks.length).toFixed(1),
    totalFreeEntries: landmarks.filter(l => l.entranceFee === 0).length,
  };
}

export default landmarks;
