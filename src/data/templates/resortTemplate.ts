import { Project } from '../../types/project';

export const RESORT_TEMPLATE: Project = {
  id: 'template-resort-cottage',
  name: 'Kerala Backwater Eco-Resort & Spa',
  type: 'resort',
  description: 'An eco-luxury backwater resort project with a traditional wooden reception pavilion, individual heritage cottages, infinity swimming pool, and tropical landscaped pathways.',
  createdAt: '2024-10-17T11:00:00Z',
  updatedAt: '2024-10-19T10:00:00Z',
  metadata: {
    location: 'Kumarakom, Kottayam, Kerala',
    plotLength: 75.0,
    plotWidth: 50.0,
    plotArea: 3750.0,
    floorsCount: 1,
    budget: 48000000, // ₹4.80 Crores
    currency: 'INR',
    style: 'Kerala Heritage Vernacular',
    region: 'kerala_in',
    buildingCodeProfile: 'Kerala CRZ & Eco-Tourism Guidelines',
  },
  floors: [
    { id: 'resort-ground', name: 'Ground Level', elevation: 0.0, height: 3.5 },
  ],
  components: [
    // Cottage 1 Floor Slab
    {
      id: 'cottage-1-slab',
      type: 'floor',
      name: 'Heritage Cottage 1 Foundation & Wood Finish',
      floorId: 'resort-ground',
      materialId: 'mat-vitrified-tile-600',
      transform: { position: [-12.0, 0, -8.0], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 0.2, thickness: 7.0 },
    },
    // Cottage 1 Laterite Stone Walls
    {
      id: 'w-c1-n',
      type: 'wall',
      name: 'Cottage 1 North Laterite Wall',
      floorId: 'resort-ground',
      materialId: 'mat-laterite-stone',
      transform: { position: [-16.0, 0, -11.5], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 3.2, thickness: 0.23 },
    },
    {
      id: 'w-c1-s',
      type: 'wall',
      name: 'Cottage 1 South Verandah Wall',
      floorId: 'resort-ground',
      materialId: 'mat-laterite-stone',
      transform: { position: [-16.0, 0, -4.5], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 3.2, thickness: 0.23 },
      openings: [
        { id: 'op-c1-door', componentId: 'door-c1', offset: 3.0, width: 1.2, height: 2.1, sillHeight: 0 },
      ],
    },
    // Cottage 1 Sloping Clay Roof
    {
      id: 'roof-c1',
      type: 'roof',
      name: 'Cottage 1 Mangalore Tile Roof',
      floorId: 'resort-ground',
      materialId: 'mat-kerala-clay-tile',
      transform: { position: [-12.0, 3.2, -8.0], rotation: [0, 0, 0] },
      dimensions: { length: 9.0, height: 1.8, thickness: 8.0, pitch: 35 },
    },
    // Infinity Pool
    {
      id: 'pool-main',
      type: 'landscape',
      name: 'Backwater View Infinity Pool (15m x 6m)',
      floorId: 'resort-ground',
      materialId: 'mat-vitrified-tile-600',
      transform: { position: [10.0, -1.2, 0], rotation: [0, 0, 0] },
      dimensions: { length: 15.0, height: 1.4, thickness: 6.0 },
    },
    // Surrounding Tropical Lawn
    {
      id: 'resort-lawn',
      type: 'landscape',
      name: 'Lakeside Landscaped Turf & Coconut Grove',
      floorId: 'resort-ground',
      materialId: 'mat-kerala-lawn-grass',
      transform: { position: [0, -0.05, 5.0], rotation: [0, 0, 0] },
      dimensions: { length: 30.0, height: 0.05, thickness: 15.0 },
    },
  ],
};
