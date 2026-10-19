export type RoomMediaType = 
  | 'panorama_360' 
  | 'video_360' 
  | 'ordinary_photo' 
  | 'measured_dimensions';

export type PhotoWallLabel = 
  | 'front_wall' 
  | 'back_wall' 
  | 'left_wall' 
  | 'right_wall' 
  | 'ceiling' 
  | 'floor' 
  | 'details' 
  | 'other';

export interface RoomMedia {
  id: string;
  type: RoomMediaType;
  name: string;
  url: string; // Object URL or base64 data URI
  fileSize: number;
  label?: PhotoWallLabel;
  aspectRatio?: number;
  isEquirectangular?: boolean;
  extractedFrames?: string[];
  timestamp: string;
}

export type RoomClassification = 
  | 'living_room' 
  | 'bedroom' 
  | 'kitchen' 
  | 'dining_room' 
  | 'bathroom' 
  | 'home_office' 
  | 'studio' 
  | 'hotel_suite' 
  | 'wedding_hall';

export interface DetectedRoomOpening {
  id: string;
  type: 'door' | 'window';
  wall: 'north' | 'south' | 'east' | 'west';
  offset: number;     // metres along wall
  width: number;      // metres
  height: number;     // metres
  sillHeight: number; // metres
}

export interface DetectedExistingFurniture {
  id: string;
  label: string;
  approximatePosition: [number, number, number];
  approximateSize: [number, number, number];
  keepOrRemove: 'keep' | 'remove';
}

export interface RoomAnalysisResult {
  roomType: RoomClassification;
  confidence: 'high' | 'medium' | 'estimated';
  inferredDimensions: { length: number; width: number; height: number };
  verifiedDimensions: { length: number; width: number; height: number };
  isDimensionUserConfirmed: boolean;
  detectedOpenings: DetectedRoomOpening[];
  detectedExistingFurniture: DetectedExistingFurniture[];
  dominantColors: string[];
  lightingConditions: 'bright_daylight' | 'moderate' | 'dim' | 'artificial';
  notes: string;
}

export type RetailerName = 
  | 'Amazon India' 
  | 'Flipkart' 
  | 'IKEA India' 
  | 'Kerala Local / Nilambur Crafts'
  | 'Custom User Supplier';

export type ProductVerificationStatus = 
  | 'verified_official' 
  | 'user_provided' 
  | 'catalog_sample' 
  | 'unverified';

export interface RetailerProduct {
  id: string;
  name: string;
  brand: string;
  sku: string;
  retailer: RetailerName;
  productUrl: string;
  imageUrl?: string;
  unitPrice: number;       // INR ₹
  currency: 'INR';
  dimensions: {
    length: number;    // metres (width)
    height: number;    // metres (height)
    thickness: number; // metres (depth)
  };
  weight?: number;     // kg
  material: string;
  color?: string;
  finish?: string;
  category: string;    // 'sofas' | 'beds' | 'dining_tables' | 'storage' | 'lighting' etc.
  deliveryCharge: number;
  installationCharge: number;
  warranty?: string;
  availability: 'in_stock' | 'limited' | 'special_order' | 'out_of_stock' | 'unknown';
  localityAvailability: Record<string, boolean>; // e.g. { 'Kochi': true, 'Thrissur': true }
  verificationStatus: ProductVerificationStatus;
  lastVerifiedDate: string;
  rating?: number;
  reviewCount?: number;
}

export interface PlacedProductInstance {
  instanceId: string;
  productId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: { length: number; height: number; thickness: number };
  fitStatus: 'ok' | 'warning' | 'collision';
  fitNotes?: string;
}

export type InteriorDesignStyle = 
  | 'modern_minimalist' 
  | 'contemporary_luxury' 
  | 'scandinavian' 
  | 'industrial' 
  | 'traditional_indian' 
  | 'kerala_contemporary' 
  | 'tropical_resort' 
  | 'japandi' 
  | 'budget_modern' 
  | 'hotel_suite';

export interface InteriorDesignPreferences {
  roomType: RoomClassification;
  roomDimensions: { length: number; width: number; height: number };
  style: InteriorDesignStyle;
  targetBudget: number; // INR ₹
  currency: 'INR';
  preferredRetailers: string[];
  keralaDistrict: string;
  colorPreferences?: string[];
  materials?: string[];
  specialRequirements?: string;
}

export interface ShoppingListItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  retailer: RetailerName;
  productUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  deliveryCharge: number;
  installationCharge: number;
  status: 'to_buy' | 'purchased' | 'delivered' | 'installed';
  dimensions: { length: number; height: number; thickness: number };
  category: string;
  notes?: string;
}

export interface InteriorBudgetBreakdown {
  furnitureSubtotal: number;
  finishesSubtotal: number;
  lightingSubtotal: number;
  decorSubtotal: number;
  deliverySubtotal: number;
  installationSubtotal: number;
  directTotal: number;
  gstAmount: number;
  contingencyAmount: number;
  grandTotal: number;
  targetBudget: number;
  budgetRemaining: number;
  isWithinBudget: boolean;
  isComplete: boolean;
  missingPriceCount: number;
}

export interface InteriorDesignAlternative {
  id: string;
  tier: 'budget' | 'balanced' | 'premium';
  title: string;
  description: string;
  style: InteriorDesignStyle;
  colorPalette: string[];
  wallFinish: string;
  floorFinish: string;
  ceilingFinish: string;
  placedProducts: PlacedProductInstance[];
  budget: InteriorBudgetBreakdown;
  shoppingList: ShoppingListItem[];
  spaceUtilizationNotes: string;
  lightingNotes: string;
}

export type RoomProcessingStage = 
  | 'idle'
  | 'uploading'
  | 'validating'
  | 'extracting_frames'
  | 'analyzing'
  | 'measuring'
  | 'confirming_geometry'
  | 'generating_designs'
  | 'ready';
