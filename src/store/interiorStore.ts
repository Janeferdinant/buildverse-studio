import { create } from 'zustand';
import { 
  RoomMedia, 
  RoomProcessingStage, 
  RoomAnalysisResult, 
  InteriorDesignPreferences, 
  InteriorDesignAlternative, 
  PlacedProductInstance, 
  RetailerProduct, 
  PhotoWallLabel,
  ShoppingListItem
} from '../types/interior';
import { REAL_WORLD_PRODUCTS } from '../data/retailerProductCatalog';
import { analyzeRoomMedia } from '../engine/roomAnalysisEngine';
import { generateDesignAlternatives, calculateInteriorBudget, buildShoppingList } from '../engine/interiorDesignGenerator';

interface InteriorState {
  uploadedMedia: RoomMedia[];
  processingStage: RoomProcessingStage;
  roomAnalysis: RoomAnalysisResult | null;
  preferences: InteriorDesignPreferences;
  activeAlternativeTier: 'budget' | 'balanced' | 'premium';
  alternatives: [InteriorDesignAlternative, InteriorDesignAlternative, InteriorDesignAlternative] | null;
  placedProducts: PlacedProductInstance[];
  selectedPlacedInstanceId: string | null;
  activeProductForReplacement: PlacedProductInstance | null;
  comparisonProductIds: string[];
  catalog: RetailerProduct[];
  isComparisonModalOpen: boolean;
  isReplacementDrawerOpen: boolean;
  isPreferencesModalOpen: boolean;
  viewMode3D: 'rendered' | 'clearance' | 'top_plan';
  dayNightMode: 'day' | 'sunset' | 'night';

  // Actions
  resetStore: () => void;
  addMedia: (media: RoomMedia) => void;
  removeMedia: (id: string) => void;
  updateMediaLabel: (id: string, label: PhotoWallLabel) => void;
  setProcessingStage: (stage: RoomProcessingStage) => void;
  setRoomAnalysis: (analysis: RoomAnalysisResult) => void;
  confirmDimensions: (dimensions: { length: number; width: number; height: number }) => void;
  setPreferences: (partial: Partial<InteriorDesignPreferences>) => void;
  generateAlternatives: () => void;
  setActiveAlternativeTier: (tier: 'budget' | 'balanced' | 'premium') => void;
  replacePlacedProduct: (instanceId: string, newProductId: string) => void;
  updatePlacedProductTransform: (
    instanceId: string,
    position: [number, number, number],
    rotation: [number, number, number]
  ) => void;
  addPlacedProduct: (product: RetailerProduct, position?: [number, number, number]) => void;
  removePlacedProduct: (instanceId: string) => void;
  setSelectedPlacedInstanceId: (id: string | null) => void;
  setActiveProductForReplacement: (instance: PlacedProductInstance | null) => void;
  toggleProductInComparison: (productId: string) => void;
  clearComparison: () => void;
  setComparisonModalOpen: (open: boolean) => void;
  setReplacementDrawerOpen: (open: boolean) => void;
  setPreferencesModalOpen: (open: boolean) => void;
  setViewMode3D: (mode: 'rendered' | 'clearance' | 'top_plan') => void;
  setDayNightMode: (mode: 'day' | 'sunset' | 'night') => void;
  updateShoppingItemStatus: (productId: string, status: ShoppingListItem['status']) => void;
}

const defaultPreferences: InteriorDesignPreferences = {
  roomType: 'living_room',
  roomDimensions: { length: 5.5, width: 4.5, height: 3.0 },
  style: 'kerala_contemporary',
  targetBudget: 150000,
  currency: 'INR',
  preferredRetailers: ['IKEA India', 'Kerala Local / Nilambur Crafts', 'Amazon India'],
  keralaDistrict: 'Kochi',
};

export const useInteriorStore = create<InteriorState>((set, get) => ({
  uploadedMedia: [],
  processingStage: 'idle',
  roomAnalysis: null,
  preferences: defaultPreferences,
  activeAlternativeTier: 'balanced',
  alternatives: null,
  placedProducts: [],
  selectedPlacedInstanceId: null,
  activeProductForReplacement: null,
  comparisonProductIds: [],
  catalog: [...REAL_WORLD_PRODUCTS],
  isComparisonModalOpen: false,
  isReplacementDrawerOpen: false,
  isPreferencesModalOpen: false,
  viewMode3D: 'rendered',
  dayNightMode: 'day',

  resetStore: () => {
    set({
      uploadedMedia: [],
      processingStage: 'idle',
      roomAnalysis: null,
      preferences: defaultPreferences,
      activeAlternativeTier: 'balanced',
      alternatives: null,
      placedProducts: [],
      selectedPlacedInstanceId: null,
      activeProductForReplacement: null,
      comparisonProductIds: [],
      catalog: [...REAL_WORLD_PRODUCTS],
      isComparisonModalOpen: false,
      isReplacementDrawerOpen: false,
      isPreferencesModalOpen: false,
      viewMode3D: 'rendered',
      dayNightMode: 'day',
    });
  },

  addMedia: (media) => {
    const nextMedia = [...get().uploadedMedia, media];
    set({ uploadedMedia: nextMedia });
    // Run preliminary analysis
    const analysis = analyzeRoomMedia(nextMedia);
    set({
      roomAnalysis: analysis,
      preferences: {
        ...get().preferences,
        roomType: analysis.roomType,
        roomDimensions: analysis.verifiedDimensions,
      },
    });
  },

  removeMedia: (id) => {
    const nextMedia = get().uploadedMedia.filter((m) => m.id !== id);
    set({ uploadedMedia: nextMedia });
    if (nextMedia.length > 0) {
      set({ roomAnalysis: analyzeRoomMedia(nextMedia) });
    }
  },

  updateMediaLabel: (id, label) => {
    const nextMedia = get().uploadedMedia.map((m) => (m.id === id ? { ...m, label } : m));
    set({ uploadedMedia: nextMedia });
    set({ roomAnalysis: analyzeRoomMedia(nextMedia) });
  },

  setProcessingStage: (stage) => set({ processingStage: stage }),

  setRoomAnalysis: (analysis) => set({ roomAnalysis: analysis }),

  confirmDimensions: (dimensions) => {
    const analysis = get().roomAnalysis;
    const updatedAnalysis: RoomAnalysisResult = analysis
      ? {
          ...analysis,
          verifiedDimensions: dimensions,
          isDimensionUserConfirmed: true,
          confidence: 'high',
        }
      : analyzeRoomMedia(get().uploadedMedia, dimensions);

    set({
      roomAnalysis: updatedAnalysis,
      preferences: {
        ...get().preferences,
        roomDimensions: dimensions,
      },
    });
  },

  setPreferences: (partial) => {
    set((state) => ({
      preferences: { ...state.preferences, ...partial },
    }));
  },

  generateAlternatives: () => {
    const { preferences, catalog } = get();
    const alternatives = generateDesignAlternatives(preferences, catalog);

    // Active tier determines initial placed products in 3D
    const activeTier = get().activeAlternativeTier;
    const activeAlt = alternatives.find((a) => a.tier === activeTier) || alternatives[1];

    set({
      alternatives,
      placedProducts: JSON.parse(JSON.stringify(activeAlt.placedProducts)),
      processingStage: 'ready',
    });
  },

  setActiveAlternativeTier: (tier) => {
    const alternatives = get().alternatives;
    if (!alternatives) {
      set({ activeAlternativeTier: tier });
      return;
    }

    const selectedAlt = alternatives.find((a) => a.tier === tier);
    if (selectedAlt) {
      set({
        activeAlternativeTier: tier,
        placedProducts: JSON.parse(JSON.stringify(selectedAlt.placedProducts)),
        selectedPlacedInstanceId: null,
      });
    }
  },

  replacePlacedProduct: (instanceId, newProductId) => {
    const { placedProducts, catalog, preferences, alternatives, activeAlternativeTier } = get();
    const newProduct = catalog.find((p) => p.id === newProductId);
    if (!newProduct) return;

    const nextPlaced = placedProducts.map((inst) => {
      if (inst.instanceId === instanceId) {
        return {
          ...inst,
          productId: newProduct.id,
          dimensions: { ...newProduct.dimensions },
        };
      }
      return inst;
    });

    // Recalculate budget and shopping list for active alternative
    const updatedBudget = calculateInteriorBudget(nextPlaced, catalog, preferences);
    const updatedShoppingList = buildShoppingList(nextPlaced, catalog);

    let updatedAlternatives = alternatives;
    if (alternatives) {
      updatedAlternatives = alternatives.map((alt) => {
        if (alt.tier === activeAlternativeTier) {
          return {
            ...alt,
            placedProducts: nextPlaced,
            budget: updatedBudget,
            shoppingList: updatedShoppingList,
          };
        }
        return alt;
      }) as [InteriorDesignAlternative, InteriorDesignAlternative, InteriorDesignAlternative];
    }

    set({
      placedProducts: nextPlaced,
      alternatives: updatedAlternatives,
      isReplacementDrawerOpen: false,
      activeProductForReplacement: null,
    });
  },

  updatePlacedProductTransform: (instanceId, position, rotation) => {
    const nextPlaced = get().placedProducts.map((inst) => {
      if (inst.instanceId === instanceId) {
        return { ...inst, position, rotation };
      }
      return inst;
    });
    set({ placedProducts: nextPlaced });
  },

  addPlacedProduct: (product, position) => {
    const { placedProducts, catalog, preferences, alternatives, activeAlternativeTier } = get();
    const newInstance: PlacedProductInstance = {
      instanceId: `inst-${Date.now()}`,
      productId: product.id,
      position: position || [0, 0, 0],
      rotation: [0, 0, 0],
      dimensions: { ...product.dimensions },
      fitStatus: 'ok',
    };

    const nextPlaced = [...placedProducts, newInstance];
    const updatedBudget = calculateInteriorBudget(nextPlaced, catalog, preferences);
    const updatedShoppingList = buildShoppingList(nextPlaced, catalog);

    let updatedAlternatives = alternatives;
    if (alternatives) {
      updatedAlternatives = alternatives.map((alt) => {
        if (alt.tier === activeAlternativeTier) {
          return {
            ...alt,
            placedProducts: nextPlaced,
            budget: updatedBudget,
            shoppingList: updatedShoppingList,
          };
        }
        return alt;
      }) as [InteriorDesignAlternative, InteriorDesignAlternative, InteriorDesignAlternative];
    }

    set({
      placedProducts: nextPlaced,
      alternatives: updatedAlternatives,
      selectedPlacedInstanceId: newInstance.instanceId,
    });
  },

  removePlacedProduct: (instanceId) => {
    const { placedProducts, catalog, preferences, alternatives, activeAlternativeTier } = get();
    const nextPlaced = placedProducts.filter((p) => p.instanceId !== instanceId);
    const updatedBudget = calculateInteriorBudget(nextPlaced, catalog, preferences);
    const updatedShoppingList = buildShoppingList(nextPlaced, catalog);

    let updatedAlternatives = alternatives;
    if (alternatives) {
      updatedAlternatives = alternatives.map((alt) => {
        if (alt.tier === activeAlternativeTier) {
          return {
            ...alt,
            placedProducts: nextPlaced,
            budget: updatedBudget,
            shoppingList: updatedShoppingList,
          };
        }
        return alt;
      }) as [InteriorDesignAlternative, InteriorDesignAlternative, InteriorDesignAlternative];
    }

    set({
      placedProducts: nextPlaced,
      alternatives: updatedAlternatives,
      selectedPlacedInstanceId: null,
    });
  },

  setSelectedPlacedInstanceId: (id) => set({ selectedPlacedInstanceId: id }),

  setActiveProductForReplacement: (instance) =>
    set({
      activeProductForReplacement: instance,
      isReplacementDrawerOpen: !!instance,
    }),

  toggleProductInComparison: (productId) => {
    const current = get().comparisonProductIds;
    if (current.includes(productId)) {
      set({ comparisonProductIds: current.filter((id) => id !== productId) });
    } else {
      if (current.length >= 4) {
        // Keep max 4 items
        set({ comparisonProductIds: [...current.slice(1), productId] });
      } else {
        set({ comparisonProductIds: [...current, productId] });
      }
    }
  },

  clearComparison: () => set({ comparisonProductIds: [] }),

  setComparisonModalOpen: (open) => set({ isComparisonModalOpen: open }),
  setReplacementDrawerOpen: (open) => set({ isReplacementDrawerOpen: open }),
  setPreferencesModalOpen: (open) => set({ isPreferencesModalOpen: open }),
  setViewMode3D: (mode) => set({ viewMode3D: mode }),
  setDayNightMode: (mode) => set({ dayNightMode: mode }),

  updateShoppingItemStatus: (productId, status) => {
    const alternatives = get().alternatives;
    if (!alternatives) return;

    const nextAlts = alternatives.map((alt) => ({
      ...alt,
      shoppingList: alt.shoppingList.map((item) =>
        item.productId === productId ? { ...item, status } : item
      ),
    })) as [InteriorDesignAlternative, InteriorDesignAlternative, InteriorDesignAlternative];

    set({ alternatives: nextAlts });
  },
}));
