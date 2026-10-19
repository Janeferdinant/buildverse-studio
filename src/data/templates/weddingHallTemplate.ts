import { Project } from '../../types/project';

export const WEDDING_HALL_TEMPLATE: Project = {
  id: 'template-wedding-hall',
  name: 'Grand Royal Kerala Convention & Wedding Hall',
  type: 'wedding_hall',
  description: 'A 1000-guest convention and wedding centre featuring a 30m x 20m pillar-free main auditorium, elevated wedding stage, 400-capacity dining hall, VIP green rooms, and extensive courtyard parking.',
  createdAt: '2024-10-16T10:00:00Z',
  updatedAt: '2024-10-19T10:00:00Z',
  metadata: {
    location: 'Edappally, Kochi, Kerala',
    plotLength: 60.0,
    plotWidth: 45.0,
    plotArea: 2700.0, // ~66 cents
    floorsCount: 1,
    budget: 35000000, // ₹3.50 Crores
    currency: 'INR',
    style: 'Contemporary Commercial Convention',
    region: 'kerala_in',
    buildingCodeProfile: 'National Building Code 2016 (Assembly Buildings Group D)',
  },
  floors: [
    { id: 'hall-ground', name: 'Main Ground Level', elevation: 0.0, height: 6.5 },
  ],
  components: [
    // Main Hall Floor Slab (30m x 20m = 600 m2)
    {
      id: 'hall-slab-main',
      type: 'floor',
      name: 'Main Auditorium Vitrified Floor Slab',
      floorId: 'hall-ground',
      materialId: 'mat-vitrified-tile-600',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      dimensions: { length: 30.0, height: 0.25, thickness: 20.0 },
    },
    // Stage Platform (10m x 6m x 0.9m elevation)
    {
      id: 'hall-stage-platform',
      type: 'floor',
      name: 'Grand Wedding Mandap & Stage Platform',
      floorId: 'hall-ground',
      materialId: 'mat-granite-slab',
      transform: { position: [0, 0.9, -7.0], rotation: [0, 0, 0] },
      dimensions: { length: 12.0, height: 0.9, thickness: 5.0 },
    },
    // North Acoustic Wall (Length: 30m)
    {
      id: 'w-hall-north',
      type: 'wall',
      name: 'North Stage Backdrop Wall',
      floorId: 'hall-ground',
      materialId: 'mat-concrete-block-6in',
      transform: { position: [-15, 0, -10], rotation: [0, 0, 0] },
      dimensions: { length: 30.0, height: 6.5, thickness: 0.23 },
    },
    // South Foyer Entrance Wall (Length: 30m, 3 wide double doors)
    {
      id: 'w-hall-south',
      type: 'wall',
      name: 'South Grand Entrance Wall',
      floorId: 'hall-ground',
      materialId: 'mat-concrete-block-6in',
      transform: { position: [-15, 0, 10], rotation: [0, 0, 0] },
      dimensions: { length: 30.0, height: 6.5, thickness: 0.23 },
      openings: [
        { id: 'op-door-h1', componentId: 'door-h1', offset: 5.0, width: 2.4, height: 2.8, sillHeight: 0 },
        { id: 'op-door-h2', componentId: 'door-h2', offset: 13.8, width: 2.4, height: 2.8, sillHeight: 0 },
        { id: 'op-door-h3', componentId: 'door-h3', offset: 22.6, width: 2.4, height: 2.8, sillHeight: 0 },
      ],
    },
    // West Dining Hall Connection Wall (Length: 20m)
    {
      id: 'w-hall-west',
      type: 'wall',
      name: 'West Wall (Dining Hall Connect)',
      floorId: 'hall-ground',
      materialId: 'mat-concrete-block-6in',
      transform: { position: [-15, 0, -10], rotation: [0, Math.PI / 2, 0] },
      dimensions: { length: 20.0, height: 6.5, thickness: 0.23 },
      openings: [
        { id: 'op-door-dining-1', componentId: 'door-d1', offset: 4.0, width: 2.0, height: 2.4, sillHeight: 0 },
        { id: 'op-door-dining-2', componentId: 'door-d2', offset: 14.0, width: 2.0, height: 2.4, sillHeight: 0 },
      ],
    },
    // East Wall (Length: 20m)
    {
      id: 'w-hall-east',
      type: 'wall',
      name: 'East Garden Glass Wall',
      floorId: 'hall-ground',
      materialId: 'mat-concrete-block-6in',
      transform: { position: [15, 0, -10], rotation: [0, Math.PI / 2, 0] },
      dimensions: { length: 20.0, height: 6.5, thickness: 0.23 },
      openings: [
        { id: 'op-win-he1', componentId: 'win-he1', offset: 3.0, width: 3.0, height: 2.5, sillHeight: 1.0 },
        { id: 'op-win-he2', componentId: 'win-he2', offset: 10.0, width: 3.0, height: 2.5, sillHeight: 1.0 },
      ],
    },
    // Steel Truss & Kerala Slope Roof
    {
      id: 'hall-roof',
      type: 'roof',
      name: 'Auditorium Structural Steel Truss Roof',
      floorId: 'hall-ground',
      materialId: 'mat-kerala-clay-tile',
      transform: { position: [0, 6.5, 0], rotation: [0, 0, 0] },
      dimensions: { length: 32.0, height: 3.5, thickness: 22.0, pitch: 20 },
    },
    // Sample Banquet Chairs (Representative rows)
    {
      id: 'furn-banquet-row-1',
      type: 'furniture',
      name: 'Auditorium Seating Section A (150 Chairs)',
      floorId: 'hall-ground',
      materialId: 'mat-banquet-chair',
      transform: { position: [-6.0, 0, 1.0], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 0.85, thickness: 4.0 },
      properties: { chairCount: 150, layout: 'theatre' },
    },
    {
      id: 'furn-banquet-row-2',
      type: 'furniture',
      name: 'Auditorium Seating Section B (150 Chairs)',
      floorId: 'hall-ground',
      materialId: 'mat-banquet-chair',
      transform: { position: [6.0, 0, 1.0], rotation: [0, 0, 0] },
      dimensions: { length: 8.0, height: 0.85, thickness: 4.0 },
      properties: { chairCount: 150, layout: 'theatre' },
    },
    // Paved Car Parking Area
    {
      id: 'land-hall-parking',
      type: 'landscape',
      name: 'Visitor Interlocking Paver Parking (80 Cars)',
      floorId: 'hall-ground',
      materialId: 'mat-interlock-paver',
      transform: { position: [0, -0.05, 20.0], rotation: [0, 0, 0] },
      dimensions: { length: 35.0, height: 0.08, thickness: 15.0 },
    },
  ],
};
