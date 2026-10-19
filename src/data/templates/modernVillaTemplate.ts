import { Project } from '../../types/project';

export const MODERN_VILLA_TEMPLATE: Project = {
  id: 'template-modern-villa',
  name: 'Kerala Contemporary Tropical Villa',
  type: 'villa',
  description: 'A 2-storey contemporary tropical villa designed for Kerala climate with open courtyard, wide sit-out, high ceiling living hall, and sloping clay tile roof.',
  createdAt: '2024-10-15T09:00:00Z',
  updatedAt: '2024-10-19T10:00:00Z',
  metadata: {
    location: 'Kakkanad, Kochi, Kerala',
    plotLength: 22.0, // 22 metres (~72 ft)
    plotWidth: 16.0,  // 16 metres (~52 ft)
    plotArea: 352.0,  // ~8.7 cents / 352 m2
    floorsCount: 2,
    budget: 7800000,  // ₹78 Lakhs
    currency: 'INR',
    style: 'Kerala Tropical Contemporary',
    region: 'kerala_in',
    buildingCodeProfile: 'Kerala Municipality Building Rules (KMBR 2019)',
  },
  floors: [
    { id: 'floor-ground', name: 'Ground Floor', elevation: 0.0, height: 3.2 },
    { id: 'floor-first', name: 'First Floor', elevation: 3.2, height: 3.0 },
  ],
  components: [
    // --- GROUND FLOOR SLAB ---
    {
      id: 'gf-slab-main',
      type: 'floor',
      name: 'Ground Floor Foundation & Tile Slab',
      floorId: 'floor-ground',
      materialId: 'mat-vitrified-tile-600',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 12.0, height: 0.2, thickness: 10.0 }, // 12m x 10m = 120 m2
    },

    // --- EXTERIOR WALLS ---
    // North Wall (Length: 12m, with 2 windows)
    {
      id: 'w-gf-north',
      type: 'wall',
      name: 'North Exterior Wall',
      floorId: 'floor-ground',
      materialId: 'mat-brick-9in',
      transform: { position: [-6, 0, -5], rotation: [0, 0, 0] },
      dimensions: { length: 12.0, height: 3.2, thickness: 0.23 },
      openings: [
        { id: 'op-win-n1', componentId: 'win-n1', offset: 2.5, width: 1.5, height: 1.2, sillHeight: 0.9 },
        { id: 'op-win-n2', componentId: 'win-n2', offset: 8.0, width: 1.5, height: 1.2, sillHeight: 0.9 },
      ],
    },
    // South Wall (Length: 12m, with Main Entrance Door and sit-out window)
    {
      id: 'w-gf-south',
      type: 'wall',
      name: 'South Facade Wall (Main Entrance)',
      floorId: 'floor-ground',
      materialId: 'mat-brick-9in',
      transform: { position: [-6, 0, 5], rotation: [0, 0, 0] },
      dimensions: { length: 12.0, height: 3.2, thickness: 0.23 },
      openings: [
        { id: 'op-door-main', componentId: 'door-main', offset: 4.5, width: 1.2, height: 2.1, sillHeight: 0 },
        { id: 'op-win-s1', componentId: 'win-s1', offset: 8.5, width: 1.5, height: 1.2, sillHeight: 0.9 },
      ],
    },
    // West Wall (Length: 10m)
    {
      id: 'w-gf-west',
      type: 'wall',
      name: 'West Boundary Wall',
      floorId: 'floor-ground',
      materialId: 'mat-brick-9in',
      transform: { position: [-6, 0, -5], rotation: [0, Math.PI / 2, 0] },
      dimensions: { length: 10.0, height: 3.2, thickness: 0.23 },
      openings: [
        { id: 'op-win-w1', componentId: 'win-w1', offset: 3.0, width: 1.2, height: 1.2, sillHeight: 0.9 },
      ],
    },
    // East Wall (Length: 10m, with kitchen service door)
    {
      id: 'w-gf-east',
      type: 'wall',
      name: 'East Garden Wall',
      floorId: 'floor-ground',
      materialId: 'mat-brick-9in',
      transform: { position: [6, 0, -5], rotation: [0, Math.PI / 2, 0] },
      dimensions: { length: 10.0, height: 3.2, thickness: 0.23 },
      openings: [
        { id: 'op-door-east', componentId: 'door-east', offset: 5.0, width: 0.9, height: 2.1, sillHeight: 0 },
        { id: 'op-win-e1', componentId: 'win-e1', offset: 1.5, width: 1.2, height: 1.2, sillHeight: 0.9 },
      ],
    },

    // --- INTERNAL PARTITION WALL ---
    {
      id: 'w-gf-part-1',
      type: 'wall',
      name: 'Living / Master Bedroom Partition',
      floorId: 'floor-ground',
      materialId: 'mat-brick-9in',
      transform: { position: [0, 0, -5], rotation: [0, Math.PI / 2, 0] },
      dimensions: { length: 6.0, height: 3.2, thickness: 0.12 },
      openings: [
        { id: 'op-door-bed1', componentId: 'door-bed1', offset: 2.0, width: 0.9, height: 2.1, sillHeight: 0 },
      ],
    },

    // --- DOORS & WINDOWS (Component Entities) ---
    {
      id: 'door-main',
      type: 'door',
      name: 'Carved Teak Main Entrance Door',
      floorId: 'floor-ground',
      materialId: 'mat-teak-door',
      transform: { position: [-1.5, 0, 5], rotation: [0, 0, 0] },
      dimensions: { length: 1.2, height: 2.1, thickness: 0.12 },
    },
    {
      id: 'door-east',
      type: 'door',
      name: 'Kitchen Service Door',
      floorId: 'floor-ground',
      materialId: 'mat-internal-flush-door',
      transform: { position: [6, 0, 0], rotation: [0, Math.PI / 2, 0] },
      dimensions: { length: 0.9, height: 2.1, thickness: 0.12 },
    },
    {
      id: 'win-n1',
      type: 'window',
      name: 'Master Bedroom North Window',
      floorId: 'floor-ground',
      materialId: 'mat-upvc-window',
      transform: { position: [-3.5, 0.9, -5], rotation: [0, 0, 0] },
      dimensions: { length: 1.5, height: 1.2, thickness: 0.12, sillHeight: 0.9 },
    },
    {
      id: 'win-s1',
      type: 'window',
      name: 'Living Room South Window',
      floorId: 'floor-ground',
      materialId: 'mat-upvc-window',
      transform: { position: [2.5, 0.9, 5], rotation: [0, 0, 0] },
      dimensions: { length: 1.5, height: 1.2, thickness: 0.12, sillHeight: 0.9 },
    },

    // --- FIRST FLOOR CEILING SLAB & RCC BALCONY ---
    {
      id: 'ff-slab-main',
      type: 'floor',
      name: 'First Floor RCC Slab & Terrace',
      floorId: 'floor-first',
      materialId: 'mat-rcc-m25',
      transform: { position: [0, 3.2, 0], rotation: [0, 0, 0] },
      dimensions: { length: 12.0, height: 0.15, thickness: 10.0 },
    },

    // --- KERALA TRADITIONAL CLAY SLOPING ROOF ---
    {
      id: 'roof-kerala-main',
      type: 'roof',
      name: 'Kerala Clay Tile Sloping Roof (30° Pitch)',
      floorId: 'floor-first',
      materialId: 'mat-kerala-clay-tile',
      transform: { position: [0, 6.2, 0], rotation: [0, 0, 0] },
      dimensions: { length: 13.0, height: 1.8, thickness: 11.0, pitch: 30 },
    },

    // --- FURNITURE & INTERIORS ---
    {
      id: 'furn-sofa-living',
      type: 'furniture',
      name: 'Living Room 3-Seater Sofa',
      floorId: 'floor-ground',
      materialId: 'mat-luxury-sofa-3seater',
      transform: { position: [2.5, 0, 2.0], rotation: [0, -Math.PI / 2, 0] },
      dimensions: { length: 2.2, height: 0.85, thickness: 0.95 },
    },
    {
      id: 'furn-bed-master',
      type: 'furniture',
      name: 'Master Bedroom Teak King Bed',
      floorId: 'floor-ground',
      materialId: 'mat-king-bed-teak',
      transform: { position: [-3.5, 0, -2.5], rotation: [0, 0, 0] },
      dimensions: { length: 2.0, height: 1.1, thickness: 1.9 },
    },

    // --- LANDSCAPING ---
    {
      id: 'land-front-lawn',
      type: 'landscape',
      name: 'Front Garden Bermuda Lawn',
      floorId: 'floor-ground',
      materialId: 'mat-kerala-lawn-grass',
      transform: { position: [-2.0, -0.05, 8.5], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 0.05, thickness: 5.0 },
    },
    {
      id: 'land-driveway-pavers',
      type: 'landscape',
      name: 'Interlocking Paver Driveway',
      floorId: 'floor-ground',
      materialId: 'mat-interlock-paver',
      transform: { position: [5.0, -0.05, 8.5], rotation: [0, 0, 0] },
      dimensions: { length: 4.0, height: 0.06, thickness: 5.0 },
    },
  ],
};
