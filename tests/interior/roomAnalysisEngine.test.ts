import { describe, it, expect } from 'vitest';
import { 
  analyzeRoomMedia, 
  validateRoomClearances 
} from '@/engine/roomAnalysisEngine';
import { RoomMedia, PlacedProductInstance, DetectedRoomOpening } from '@/types/interior';

describe('Room Feature Analysis & Spatial Clearance Engine', () => {
  it('analyzes uploaded room media and marks inferred vs verified dimensions', () => {
    const mediaList: RoomMedia[] = [
      {
        id: 'media-pano-1',
        type: 'panorama_360',
        name: 'living_room_360_capture.jpg',
        url: 'data:image/jpeg;base64,...',
        fileSize: 4500000,
        aspectRatio: 2.0,
        isEquirectangular: true,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'media-photo-front',
        type: 'ordinary_photo',
        name: 'north_front_wall.jpg',
        url: 'data:image/jpeg;base64,...',
        fileSize: 1200000,
        label: 'front_wall',
        timestamp: new Date().toISOString(),
      },
    ];

    // Case 1: Without user measurements -> Dimensions must be marked as estimated
    const unconfirmedAnalysis = analyzeRoomMedia(mediaList);
    expect(unconfirmedAnalysis.roomType).toBe('living_room');
    expect(unconfirmedAnalysis.isDimensionUserConfirmed).toBe(false);
    expect(unconfirmedAnalysis.confidence).toBe('estimated');
    expect(unconfirmedAnalysis.inferredDimensions.length).toBeGreaterThan(0);

    // Case 2: With user confirmed dimensions -> Marked as verified
    const confirmedAnalysis = analyzeRoomMedia(mediaList, { length: 6.2, width: 4.8, height: 3.2 });
    expect(confirmedAnalysis.isDimensionUserConfirmed).toBe(true);
    expect(confirmedAnalysis.verifiedDimensions.length).toBe(6.2);
    expect(confirmedAnalysis.verifiedDimensions.width).toBe(4.8);
    expect(confirmedAnalysis.verifiedDimensions.height).toBe(3.2);
  });

  it('detects door swing collision when furniture is placed in doorway path', () => {
    const roomDim = { length: 6.0, width: 5.0, height: 3.0 };
    const openings: DetectedRoomOpening[] = [
      {
        id: 'door-south',
        type: 'door',
        wall: 'south',
        offset: 2.0,
        width: 1.0,
        height: 2.1,
        sillHeight: 0,
      },
    ];

    // Furniture placed right in front of south door threshold (at z = 2.0, within 0.5m of wall at z = 2.5)
    const placedProducts: PlacedProductInstance[] = [
      {
        instanceId: 'inst-sofa-blocking',
        productId: 'prod-ikea-sofa',
        position: [2.0, 0, 2.0],
        rotation: [0, 0, 0],
        dimensions: { length: 2.2, height: 0.85, thickness: 0.9 },
        fitStatus: 'ok',
      },
    ];

    const audit = validateRoomClearances(roomDim, placedProducts, openings);
    expect(audit.warnings.length).toBeGreaterThan(0);
    expect(audit.warnings.some((w) => w.toLowerCase().includes('door'))).toBe(true);
  });

  it('validates clean room layout with adequate walkway circulation', () => {
    const roomDim = { length: 6.0, width: 5.0, height: 3.0 };
    const openings: DetectedRoomOpening[] = [
      {
        id: 'door-clear',
        type: 'door',
        wall: 'south',
        offset: 1.0,
        width: 1.0,
        height: 2.1,
        sillHeight: 0,
      },
    ];

    // Well-placed furniture against north wall, leaving center and door open
    const placedProducts: PlacedProductInstance[] = [
      {
        instanceId: 'inst-sofa-good',
        productId: 'prod-ikea-sofa',
        position: [0, 0, -1.8],
        rotation: [0, 0, 0],
        dimensions: { length: 2.2, height: 0.85, thickness: 0.9 },
        fitStatus: 'ok',
      },
      {
        instanceId: 'inst-coffee-table-good',
        productId: 'prod-ikea-lack',
        position: [0, 0, -0.6],
        rotation: [0, 0, 0],
        dimensions: { length: 0.9, height: 0.45, thickness: 0.55 },
        fitStatus: 'ok',
      },
    ];

    const audit = validateRoomClearances(roomDim, placedProducts, openings);
    expect(audit.hasCollisions).toBe(false);
    expect(['excellent', 'adequate']).toContain(audit.circulationRating);
  });
});
