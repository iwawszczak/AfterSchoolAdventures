export interface Activity {
  id: number;
  nazwa: string;
  typ: string;
  wiek: number[];
  strona_internetowa?: string;
}

export interface PlaceObject {
  id: number;
  nazwa: string;
  lokalizacja: {
    lat: number;
    lng: number;
    adres: string;
  };
  zajecia: Activity[];
}

export interface ActivityType {
  key: string;
  label: string;
  color: string;
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { key: 'taniec', label: 'Taniec', color: '#ec4899' }, // różowy
  { key: 'gimnastyka', label: 'Gimnastyka', color: '#f97316' }, // pomarańczowy
  { key: 'pilka_nozna', label: 'Piłka nożna', color: '#22c55e' }, // zielony
  { key: 'jezyk_angielski', label: 'Język angielski', color: '#3b82f6' }, // niebieski
  { key: 'jezyk_hiszpanski', label: 'Język hiszpański', color: '#3b82f6' }, // niebieski
  { key: 'plastyka', label: 'Plastyka', color: '#8b5cf6' }, // fioletowy
  { key: 'muzyka', label: 'Muzyka', color: '#eab308' }, // żółty
  { key: 'szachy', label: 'Szachy', color: '#a16207' }, // brązowy
  { key: 'robotyka', label: 'Robotyka', color: '#ef4444' } // czerwony
];

export const AGE_GROUPS = [
  { min: 3, max: 4, label: '3-4 lata' },
  { min: 5, max: 6, label: '5-6 lat' },
  { min: 7, max: 8, label: '7-8 lat' },
  { min: 9, max: 10, label: '9-10 lat' },
  { min: 11, max: 12, label: '11-12 lat' }
];
