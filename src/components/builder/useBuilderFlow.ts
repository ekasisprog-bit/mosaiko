import { useState, useCallback, useMemo, useRef } from 'react';
import { GRID_CONFIGS, getEffectiveGridConfig, type GridSize, type GridConfig } from '@/lib/grid-config';
import {
  CATEGORY_REGISTRY,
  type CategoryType,
  type FloresTheme,
} from '@/lib/customization-types';
import type { CropArea } from '@/lib/canvas-utils';

// ─── Step system ────────────────────────────────────────────────────────────

export type StepId = 'category' | 'grid' | 'upload' | 'crop' | 'customize' | 'preview';

export function getStepsForCategory(cat: CategoryType): StepId[] {
  const meta = CATEGORY_REGISTRY[cat];
  const steps: StepId[] = ['category'];
  if (meta.allowedGridSizes.length > 1) steps.push('grid');
  steps.push('upload', 'crop');
  if (meta.textFields.length > 0 || meta.hasTheme) steps.push('customize');
  steps.push('preview');
  return steps;
}

/** i18n key for each step ID */
export const STEP_I18N_MAP: Record<StepId, string> = {
  category: 'stepCategory',
  grid: 'stepGrid',
  upload: 'stepUpload',
  crop: 'stepCrop',
  customize: 'stepCustomize',
  preview: 'stepPreview',
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface BuilderFlowState {
  // Step navigation
  currentStepId: StepId;
  stepSequence: StepId[];
  currentStepIndex: number;
  direction: number;
  goToStep: (stepId: StepId) => void;
  goBack: () => void;
  goForward: () => void;

  // Category
  selectedCategory: CategoryType | null;
  handleCategorySelect: (cat: CategoryType) => void;

  // Grid
  selectedGrid: GridSize | null;
  gridConfig: GridConfig | null;
  handleGridSelect: (grid: GridSize) => void;

  // Image
  imageSrc: string | null;
  imageFileRef: React.RefObject<File | null>;
  handleImageSelected: (file: File) => void;

  // Crop
  cropAreaPixels: CropArea | null;
  rotation: number;
  liveCropArea: CropArea | null;
  liveRotation: number;
  handleCropComplete: (croppedArea: CropArea, croppedAreaPixels: CropArea, cropRotation: number) => void;
  handleCropChange: (croppedAreaPixels: CropArea, cropRotation: number) => void;

  // Customization
  customizationValues: Record<string, string>;
  selectedTheme: FloresTheme | null;
  setCustomizationValue: (field: string, value: string) => void;
  setSelectedTheme: (theme: FloresTheme) => void;
  handleCustomizeComplete: () => void;

  // Upload state
  isUploading: boolean;
  setIsUploading: (v: boolean) => void;

  // Reset
  handleReset: () => void;
}

const DEFAULT_STEPS: StepId[] = ['category'];

export interface BuilderFlowOptions {
  initialCategory?: CategoryType | null;
  initialGrid?: GridSize | null;
}

export function useBuilderFlow(options?: BuilderFlowOptions): BuilderFlowState {
  const { initialCategory = null, initialGrid = null } = options ?? {};

  // Compute initial state from URL params
  const initState = useMemo(() => {
    if (!initialCategory || !CATEGORY_REGISTRY[initialCategory]) {
      return { category: null, grid: null, steps: DEFAULT_STEPS, startStep: 'category' as StepId };
    }

    const meta = CATEGORY_REGISTRY[initialCategory];
    const steps = getStepsForCategory(initialCategory);

    // Determine grid: use provided if valid, else auto-set for single-grid categories
    let grid: GridSize | null = null;
    if (initialGrid && meta.allowedGridSizes.includes(initialGrid)) {
      grid = initialGrid;
    } else if (meta.allowedGridSizes.length === 1) {
      grid = meta.allowedGridSizes[0];
    }

    // Start at the first unfilled step
    let startStep: StepId = 'category';
    if (grid) {
      startStep = 'upload'; // category + grid resolved → go to upload
    } else if (steps.includes('grid')) {
      startStep = 'grid'; // category resolved, but grid needed
    } else {
      startStep = 'upload';
    }

    return { category: initialCategory, grid, steps, startStep };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only compute once on mount

  // ─── Step state ───
  const [stepSequence, setStepSequence] = useState<StepId[]>(initState.steps);
  const [currentStepId, setCurrentStepId] = useState<StepId>(initState.startStep);
  const [direction, setDirection] = useState(1);

  // ─── Category ───
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(initState.category);

  // ─── Grid ───
  const [selectedGrid, setSelectedGrid] = useState<GridSize | null>(initState.grid);

  // ─── Image ───
  const [, setImageFile] = useState<File | null>(null);
  const imageFileRef = useRef<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // ─── Crop ───
  const [cropAreaPixels, setCropAreaPixels] = useState<CropArea | null>(null);
  const [rotation, setRotation] = useState(0);
  const [liveCropArea, setLiveCropArea] = useState<CropArea | null>(null);
  const [liveRotation, setLiveRotation] = useState(0);

  // ─── Customization ───
  const [customizationValues, setCustomizationValues] = useState<Record<string, string>>({});
  const [selectedTheme, setSelectedTheme] = useState<FloresTheme | null>(null);

  // ─── Upload ───
  const [isUploading, setIsUploading] = useState(false);

  // ─── Derived ───
  const gridConfig: GridConfig | null = useMemo(
    () => (selectedGrid ? getEffectiveGridConfig(selectedGrid, selectedCategory ?? undefined) : null),
    [selectedGrid, selectedCategory],
  );

  const currentStepIndex = useMemo(
    () => stepSequence.indexOf(currentStepId),
    [stepSequence, currentStepId],
  );

  // ─── Navigation ───
  const navigateTo = useCallback((stepId: StepId, steps: StepId[]) => {
    const fromIdx = steps.indexOf(currentStepId);
    const toIdx = steps.indexOf(stepId);
    setDirection(toIdx > fromIdx ? 1 : -1);
    setCurrentStepId(stepId);
  }, [currentStepId]);

  const goToStep = useCallback((stepId: StepId) => {
    navigateTo(stepId, stepSequence);
  }, [navigateTo, stepSequence]);

  const goBack = useCallback(() => {
    const idx = stepSequence.indexOf(currentStepId);
    if (idx > 0) {
      setDirection(-1);
      setCurrentStepId(stepSequence[idx - 1]);
    }
  }, [stepSequence, currentStepId]);

  const goForward = useCallback(() => {
    const idx = stepSequence.indexOf(currentStepId);
    if (idx < stepSequence.length - 1) {
      setDirection(1);
      setCurrentStepId(stepSequence[idx + 1]);
    }
  }, [stepSequence, currentStepId]);

  // ─── Category select ───
  const handleCategorySelect = useCallback((cat: CategoryType) => {
    setSelectedCategory(cat);

    const meta = CATEGORY_REGISTRY[cat];
    const newSteps = getStepsForCategory(cat);
    setStepSequence(newSteps);

    // Auto-set grid for fixed-grid categories
    if (meta.allowedGridSizes.length === 1) {
      setSelectedGrid(meta.allowedGridSizes[0]);
    } else {
      setSelectedGrid(null);
    }

    // Reset downstream state
    setCustomizationValues({});
    setSelectedTheme(null);

    // Auto-advance after selection animation
    const nextStep = newSteps[1]; // grid or upload
    setTimeout(() => {
      setDirection(1);
      setCurrentStepId(nextStep);
    }, 250);
  }, []);

  // ─── Grid select ───
  const handleGridSelect = useCallback((grid: GridSize) => {
    setSelectedGrid(grid);
    setTimeout(() => {
      setDirection(1);
      // Next step after grid is always 'upload'
      setCurrentStepId('upload');
    }, 250);
  }, []);

  // ─── Image selected ───
  const handleImageSelected = useCallback((file: File) => {
    setImageFile(file);
    imageFileRef.current = file;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setDirection(1);
    setCurrentStepId('crop');
  }, []);

  // ─── Crop handlers ───
  const handleCropComplete = useCallback(
    (_croppedArea: CropArea, croppedAreaPixels: CropArea, cropRotation: number) => {
      setCropAreaPixels(croppedAreaPixels);
      setRotation(cropRotation);
      setDirection(1);
      // Next step: customize or preview
      const nextStep = stepSequence.includes('customize') ? 'customize' : 'preview';
      setCurrentStepId(nextStep);
    },
    [stepSequence],
  );

  const handleCropChange = useCallback(
    (croppedAreaPixels: CropArea, cropRotation: number) => {
      setLiveCropArea(croppedAreaPixels);
      setLiveRotation(cropRotation);
    },
    [],
  );

  // ─── Customization handlers ───
  const setCustomizationValue = useCallback((field: string, value: string) => {
    setCustomizationValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCustomizeComplete = useCallback(() => {
    setDirection(1);
    setCurrentStepId('preview');
  }, []);

  // ─── Reset ───
  const handleReset = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setSelectedCategory(null);
    setSelectedGrid(null);
    setImageFile(null);
    imageFileRef.current = null;
    setImageSrc(null);
    setCropAreaPixels(null);
    setRotation(0);
    setLiveCropArea(null);
    setLiveRotation(0);
    setCustomizationValues({});
    setSelectedTheme(null);
    setStepSequence(DEFAULT_STEPS);
    setDirection(-1);
    setCurrentStepId('category');
  }, [imageSrc]);

  return {
    currentStepId,
    stepSequence,
    currentStepIndex,
    direction,
    goToStep,
    goBack,
    goForward,

    selectedCategory,
    handleCategorySelect,

    selectedGrid,
    gridConfig,
    handleGridSelect,

    imageSrc,
    imageFileRef,
    handleImageSelected,

    cropAreaPixels,
    rotation,
    liveCropArea,
    liveRotation,
    handleCropComplete,
    handleCropChange,

    customizationValues,
    selectedTheme,
    setCustomizationValue,
    setSelectedTheme: setSelectedTheme as (theme: FloresTheme) => void,
    handleCustomizeComplete,

    isUploading,
    setIsUploading,

    handleReset,
  };
}
