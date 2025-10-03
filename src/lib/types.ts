export interface Activity {
  id: number;
  name: string;
  type: string;
  ageGroups: number[];
  website?: string;
}

export interface PlaceObject {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  activities: Activity[];
}

export interface ActivityType {
  key: string;
  label: string;
  color: string;
}

export enum ActivityTypeKey {
  DANCE = 'dance',
  GYMNASTICS = 'gymnastics',
  FOOTBALL = 'football',
  ENGLISH = 'english',
  SPANISH = 'spanish',
  ARTS = 'arts',
  MUSIC = 'music',
  CHESS = 'chess',
  MARTIAL_ARTS = 'martial_arts',
  ROBOTICS = 'robotics',
  THEATRE = 'theatre',
  CODING = 'coding',
  MATH_CLUB = 'math_club',
  NATURE = 'nature',
  SWIMMING = 'swimming',
  ATHLETICS = 'athletics',
  BASKETBALL = 'basketball',
  VOLLEYBALL = 'volleyball',
  SCOUTS = 'scouts',
  PHOTOGRAPHY = 'photography',
  CRAFTS = 'crafts',
  COOKING = 'cooking'
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { key: 'dance', label: 'Taniec', color: '#ec4899' }, // różowy
  { key: 'gymnastics', label: 'Gimnastyka', color: '#f97316' }, // pomarańczowy
  { key: 'football', label: 'Piłka nożna', color: '#22c55e' }, // zielony
  { key: 'english', label: 'Język angielski', color: '#3b82f6' }, // niebieski
  { key: 'spanish', label: 'Język hiszpański', color: '#3b82f6' }, // niebieski
  { key: 'arts', label: 'Plastyka', color: '#8b5cf6' }, // fioletowy
  { key: 'music', label: 'Muzyka', color: '#eab308' }, // żółty
  { key: 'chess', label: 'Szachy', color: '#a16207' }, // brązowy
  { key: 'martial_arts', label: 'Sztuki walki', color: '#dc2626' }, // czerwony
  { key: 'robotics', label: 'Robotyka', color: '#7c3aed' }, // fioletowy
  { key: 'theatre', label: 'Teatr / Drama', color: '#ef4444' }, // czerwony
  { key: 'coding', label: 'Programowanie', color: '#0ea5e9' }, // jasnoniebieski
  { key: 'math_club', label: 'Kółko matematyczne', color: '#0284c7' }, // niebieski
  { key: 'nature', label: 'Przyroda / ekologia', color: '#65a30d' }, // oliwkowy
  { key: 'swimming', label: 'Pływanie', color: '#06b6d4' }, // morski
  { key: 'athletics', label: 'Lekkoatletyka', color: '#f59e0b' }, // złoty
  { key: 'basketball', label: 'Koszykówka', color: '#ea580c' }, // pomarańczowy ciemny
  { key: 'volleyball', label: 'Siatkówka', color: '#16a34a' }, // zielony ciemny
  { key: 'scouts', label: 'Harcerstwo / skauting', color: '#15803d' }, // las
  { key: 'photography', label: 'Fotografia', color: '#6d28d9' }, // fiolet ciemny
  { key: 'crafts', label: 'Rękodzieło', color: '#a855f7' }, // fiolet pastel
  { key: 'cooking', label: 'Gotowanie', color: '#d97706' } // pomarańcz złoty
];

export const AGE_GROUPS = [
  { min: 0, max: 1, label: '0-1 lat' },
  { min: 2, max: 3, label: '2-3 lata' },
  { min: 3, max: 4, label: '3-4 lata' },
  { min: 5, max: 6, label: '5-6 lat' },
  { min: 7, max: 8, label: '7-8 lat' },
  { min: 9, max: 10, label: '9-10 lat' },
  { min: 11, max: 12, label: '11-12 lat' },
  { min: 13, max: 14, label: '13-14 lat' },
  { min: 15, max: 16, label: '15-16 lat' }
];
