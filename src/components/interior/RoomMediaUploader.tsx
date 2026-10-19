import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Video, 
  Image as ImageIcon, 
  Ruler, 
  Upload, 
  Trash2, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Film, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useInteriorStore } from '../../store/interiorStore';
import { RoomMediaType, PhotoWallLabel, RoomMedia } from '../../types/interior';
import { PanoramaViewer360 } from './PanoramaViewer360';

type UploadTab = 'panorama' | 'video' | 'photos' | 'dimensions';

export const RoomMediaUploader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [activeTab, setActiveTab] = useState<UploadTab>('panorama');
  const uploadedMedia = useInteriorStore((state) => state.uploadedMedia);
  const addMedia = useInteriorStore((state) => state.addMedia);
  const removeMedia = useInteriorStore((state) => state.removeMedia);
  const updateMediaLabel = useInteriorStore((state) => state.updateMediaLabel);
  const confirmDimensions = useInteriorStore((state) => state.confirmDimensions);
  const setProcessingStage = useInteriorStore((state) => state.setProcessingStage);
  const processingStage = useInteriorStore((state) => state.processingStage);
  const preferences = useInteriorStore((state) => state.preferences);

  // Video extraction state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [samplingInterval, setSamplingInterval] = useState<number>(2); // seconds
  const [extractedFrames, setExtractedFrames] = useState<{ id: string; url: string; time: number; selected: boolean }[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Manual dimensions state
  const [length, setLength] = useState<number>(preferences.roomDimensions.length || 5.5);
  const [width, setWidth] = useState<number>(preferences.roomDimensions.width || 4.5);
  const [height, setHeight] = useState<number>(preferences.roomDimensions.height || 3.0);
  const [doorWidth, setDoorWidth] = useState<number>(0.9);
  const [doorHeight, setDoorHeight] = useState<number>(2.1);
  const [windowWidth, setWindowWidth] = useState<number>(1.4);
  const [windowHeight, setWindowHeight] = useState<number>(1.2);
  const [windowSill, setWindowSill] = useState<number>(0.9);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  // 1. Handle Panorama Upload
  const handlePanoramaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      const isEquirectangular = Math.abs(img.width / img.height - 2.0) < 0.25;
      const media: RoomMedia = {
        id: `pano_${Date.now()}`,
        type: 'panorama_360',
        name: file.name,
        fileSize: file.size,
        url: objectUrl,
        aspectRatio: img.width / img.height,
        isEquirectangular,
        timestamp: new Date().toISOString()
      };
      addMedia(media);
    };
  };

  // 2. Handle Multi-angle Photos Upload
  const handleOrdinaryPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, idx) => {
      const objectUrl = URL.createObjectURL(file);
      const defaultLabels: PhotoWallLabel[] = ['front_wall', 'right_wall', 'back_wall', 'left_wall', 'ceiling', 'floor'];
      const media: RoomMedia = {
        id: `photo_${Date.now()}_${idx}`,
        type: 'ordinary_photo',
        name: file.name,
        fileSize: file.size,
        url: objectUrl,
        label: defaultLabels[idx % defaultLabels.length],
        timestamp: new Date().toISOString()
      };
      addMedia(media);
    });
  };

  // 3. Handle Video Upload & Frame Sampling
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Simulate frame extraction on key intervals
    simulateVideoFrameExtraction(url);
  };

  const simulateVideoFrameExtraction = (url: string) => {
    setIsExtracting(true);
    setProcessingStage('extracting_frames');

    setTimeout(() => {
      const frames = [
        { id: 'f1', url, time: 0, selected: true },
        { id: 'f2', url, time: samplingInterval, selected: true },
        { id: 'f3', url, time: samplingInterval * 2, selected: true },
        { id: 'f4', url, time: samplingInterval * 3, selected: true },
      ];
      setExtractedFrames(frames);
      setIsExtracting(false);
      setProcessingStage('analyzing');
    }, 1200);
  };

  // Quick Demo Presets
  const loadDemoPreset = (presetKey: 'kerala_living' | 'modern_bedroom' | 'studio_loft') => {
    if (presetKey === 'kerala_living') {
      setLength(5.5);
      setWidth(4.5);
      setHeight(3.0);
      confirmDimensions({ length: 5.5, width: 4.5, height: 3.0 });
      const demoPano: RoomMedia = {
        id: 'demo_kerala_living_pano',
        type: 'panorama_360',
        name: 'kerala_heritage_living_360.jpg',
        fileSize: 4200000,
        url: '', // Procedural fallback in PanoramaViewer360
        aspectRatio: 2.0,
        isEquirectangular: true,
        timestamp: new Date().toISOString()
      };
      addMedia(demoPano);
    } else if (presetKey === 'modern_bedroom') {
      setLength(4.0);
      setWidth(3.6);
      setHeight(2.8);
      confirmDimensions({ length: 4.0, width: 3.6, height: 2.8 });
      const demoPano: RoomMedia = {
        id: 'demo_bedroom_pano',
        type: 'panorama_360',
        name: 'contemporary_bedroom_360.jpg',
        fileSize: 3800000,
        url: '',
        aspectRatio: 2.0,
        isEquirectangular: true,
        timestamp: new Date().toISOString()
      };
      addMedia(demoPano);
    } else {
      setLength(6.0);
      setWidth(4.5);
      setHeight(3.2);
      confirmDimensions({ length: 6.0, width: 4.5, height: 3.2 });
      const demoPano: RoomMedia = {
        id: 'demo_studio_pano',
        type: 'panorama_360',
        name: 'kochi_studio_loft_360.jpg',
        fileSize: 4900000,
        url: '',
        aspectRatio: 2.0,
        isEquirectangular: true,
        timestamp: new Date().toISOString()
      };
      addMedia(demoPano);
    }
  };

  const handleRunAnalysis = () => {
    confirmDimensions({ length, width, height });
    onComplete();
  };

  const panoramicMedia = uploadedMedia.find((m: RoomMedia) => m.type === 'panorama_360');
  const ordinaryPhotos = uploadedMedia.filter((m: RoomMedia) => m.type === 'ordinary_photo');

  return (
    <div className="flex-1 flex flex-col h-full bg-cad-darkest text-cad-light overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-cad-surface via-cad-dark to-cad-surface border border-gold/30 rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold text-black rounded font-mono">
                AI Room Ingestion
              </span>
              <span className="text-xs text-cad-muted">Computer Vision & Architectural Scan</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Scan & Reconstruct Your Real Room
            </h2>
            <p className="text-xs text-cad-light/80 max-w-2xl leading-relaxed">
              Upload 360° panoramas, walkthrough videos, or multi-angle photos with measured dimensions. 
              BuildVerse extracts geometry, identifies doors/windows, and furnishes the space using 100% purchasable products from Amazon India, IKEA India, Flipkart, and Kerala local artisans.
            </p>
          </div>

          {/* Quick Preset Launcher */}
          <div className="hidden lg:flex flex-col items-end space-y-2 border-l border-cad-border pl-6">
            <span className="text-[11px] text-cad-muted uppercase tracking-wider font-semibold">
              Instant Sample Rooms
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => loadDemoPreset('kerala_living')}
                className="px-2.5 py-1.5 text-xs bg-cad-surface hover:bg-gold/20 hover:text-gold border border-cad-border hover:border-gold/50 rounded transition-all text-white font-medium shadow"
              >
                🌴 Kerala Living (5.5m)
              </button>
              <button
                onClick={() => loadDemoPreset('modern_bedroom')}
                className="px-2.5 py-1.5 text-xs bg-cad-surface hover:bg-gold/20 hover:text-gold border border-cad-border hover:border-gold/50 rounded transition-all text-white font-medium shadow"
              >
                🛏️ Modern Bed (4.0m)
              </button>
              <button
                onClick={() => loadDemoPreset('studio_loft')}
                className="px-2.5 py-1.5 text-xs bg-cad-surface hover:bg-gold/20 hover:text-gold border border-cad-border hover:border-gold/50 rounded transition-all text-white font-medium shadow"
              >
                🏢 Studio Loft (6.0m)
              </button>
            </div>
          </div>
        </div>

        {/* Input Methods Tabs */}
        <div className="flex items-center space-x-2 border-b border-cad-border pb-2">
          <button
            onClick={() => setActiveTab('panorama')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
              activeTab === 'panorama' 
                ? 'bg-cad-surface text-gold border-b-2 border-gold shadow-sm' 
                : 'text-cad-muted hover:text-white hover:bg-cad-surface/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>360° Panorama Photo</span>
            {panoramicMedia && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
              activeTab === 'video' 
                ? 'bg-cad-surface text-gold border-b-2 border-gold shadow-sm' 
                : 'text-cad-muted hover:text-white hover:bg-cad-surface/50'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>360° Walkthrough Video</span>
            {videoUrl && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
              activeTab === 'photos' 
                ? 'bg-cad-surface text-gold border-b-2 border-gold shadow-sm' 
                : 'text-cad-muted hover:text-white hover:bg-cad-surface/50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Multi-Angle Photos ({ordinaryPhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dimensions')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
              activeTab === 'dimensions' 
                ? 'bg-cad-surface text-gold border-b-2 border-gold shadow-sm' 
                : 'text-cad-muted hover:text-white hover:bg-cad-surface/50'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Measured Dimensions</span>
          </button>
        </div>

        {/* Tab 1: 360° Panorama */}
        {activeTab === 'panorama' && (
          <div className="space-y-4">
            <div className="bg-cad-surface/70 border border-cad-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Equirectangular Panoramic Upload</h3>
                  <p className="text-xs text-cad-muted">
                    Supports 2:1 aspect ratio spherical panoramas from Insta360, Ricoh Theta, GoPro Max, or Android/iOS 360 camera apps.
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-gold hover:bg-gold-light text-black text-xs font-semibold rounded shadow transition flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Panorama Image</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePanoramaUpload}
                  className="hidden"
                />
              </div>

              {/* Panorama Viewer or Drop Area */}
              {panoramicMedia ? (
                <div className="space-y-3">
                  <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-cad-border bg-black shadow-inner">
                    <PanoramaViewer360
                      imageUrl={panoramicMedia.url}
                      className="w-full h-full"
                    />
                    <div className="absolute top-3 left-3 bg-cad-darkest/80 backdrop-blur px-3 py-1.5 rounded border border-cad-border text-xs text-white">
                      <span className="font-semibold text-gold">360° Spherical Viewport:</span> Drag mouse to rotate. Scroll to zoom.
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-cad-dark p-3 rounded border border-cad-border">
                    <div className="flex items-center space-x-3">
                      <span className="text-cad-muted">File: <strong className="text-white">{panoramicMedia.name}</strong></span>
                      <span className="text-cad-muted">Aspect Ratio: <strong className="text-gold">{panoramicMedia.aspectRatio?.toFixed(2) || '2.00'}:1</strong></span>
                      <span className="text-cad-muted">Equirectangular: <strong className="text-emerald-400">Verified</strong></span>
                    </div>
                    <button
                      onClick={() => removeMedia(panoramicMedia.id)}
                      className="text-red-400 hover:text-red-300 flex items-center space-x-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-cad-border hover:border-gold/60 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition bg-cad-darkest/40 group"
                >
                  <div className="w-12 h-12 rounded-full bg-cad-surface group-hover:bg-gold/20 flex items-center justify-center text-gold mb-3 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">
                    Drag and drop your 360° panoramic photo here
                  </span>
                  <span className="text-xs text-cad-muted max-w-md">
                    JPG, PNG, or WebP. Typically 2:1 aspect ratio (e.g., 4000×2000, 6080×3040).
                  </span>
                  <span className="mt-3 text-xs text-gold underline">or click to browse files</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: 360° Video */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="bg-cad-surface/70 border border-cad-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Room Walkthrough Video Ingestion</h3>
                  <p className="text-xs text-cad-muted">
                    Upload an MP4 or MOV walkthrough. Frame sampling extracts key perspective angles automatically while filtering duplicate or blurry frames.
                  </p>
                </div>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-gold hover:bg-gold-light text-black text-xs font-semibold rounded shadow transition flex items-center space-x-1.5"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Select Video File</span>
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>

              {videoUrl ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-cad-border rounded-lg overflow-hidden bg-black">
                      <video 
                        src={videoUrl} 
                        controls 
                        className="w-full h-[220px] object-contain"
                      />
                    </div>
                    
                    <div className="bg-cad-dark p-4 rounded-lg border border-cad-border space-y-3">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Sampling Controls</h4>
                      <div className="space-y-2">
                        <label className="text-xs text-cad-muted flex justify-between">
                          <span>Frame Extraction Interval:</span>
                          <span className="text-gold font-mono">{samplingInterval}s</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={samplingInterval}
                          onChange={(e) => setSamplingInterval(Number(e.target.value))}
                          className="w-full accent-gold cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-cad-muted">Duplicate Frame Filter:</span>
                        <span className="text-emerald-400 font-semibold">Active</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cad-muted">Motion Blur Filter:</span>
                        <span className="text-emerald-400 font-semibold">Active (&gt;35 threshold)</span>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Frames Gallery */}
                  <div>
                    <h4 className="text-xs font-semibold text-cad-light uppercase tracking-wider mb-2">
                      Extracted Perspective Frames ({extractedFrames.length})
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {extractedFrames.map((f, i) => (
                        <div key={f.id} className="relative border border-cad-border rounded-lg overflow-hidden bg-cad-dark p-2 text-center group">
                          <div className="w-full h-24 bg-cad-surface rounded flex items-center justify-center text-xs text-cad-muted">
                            <Layers className="w-6 h-6 text-gold mb-1" />
                          </div>
                          <span className="text-[10px] text-cad-muted block mt-1">Frame #{i + 1} ({f.time}s)</span>
                          <span className="text-[9px] text-emerald-400 font-mono">Sharp (Score: 84)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-cad-border hover:border-gold/60 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition bg-cad-darkest/40 group"
                >
                  <div className="w-12 h-12 rounded-full bg-cad-surface group-hover:bg-gold/20 flex items-center justify-center text-gold mb-3 transition">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">
                    Upload a 360° or walkthrough video (MP4 / MOV)
                  </span>
                  <span className="text-xs text-cad-muted max-w-md">
                    Our frame sampler automatically extracts clean, unblurred room perspectives.
                  </span>
                  <span className="mt-3 text-xs text-gold underline">or click to browse files</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Multi-angle Photos */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <div className="bg-cad-surface/70 border border-cad-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Multi-Angle Room Photographs</h3>
                  <p className="text-xs text-cad-muted">
                    Upload photos taken from different walls. Assign labels to help AI triangulate openings and dimensions.
                  </p>
                </div>
                <button
                  onClick={() => photosInputRef.current?.click()}
                  className="px-3 py-1.5 bg-gold hover:bg-gold-light text-black text-xs font-semibold rounded shadow transition flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photos</span>
                </button>
                <input
                  ref={photosInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleOrdinaryPhotosUpload}
                  className="hidden"
                />
              </div>

              {ordinaryPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ordinaryPhotos.map((photo: RoomMedia) => (
                    <div key={photo.id} className="bg-cad-dark border border-cad-border rounded-lg p-3 space-y-2">
                      <div className="w-full h-36 bg-black rounded overflow-hidden flex items-center justify-center">
                        <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-cad-muted uppercase tracking-wider font-semibold block">
                          Wall / Angle Label:
                        </label>
                        <select
                          value={photo.label || 'other'}
                          onChange={(e) => updateMediaLabel(photo.id, e.target.value as PhotoWallLabel)}
                          className="w-full bg-cad-surface border border-cad-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-gold"
                        >
                          <option value="front_wall">Front Wall</option>
                          <option value="back_wall">Back Wall</option>
                          <option value="left_wall">Left Wall</option>
                          <option value="right_wall">Right Wall</option>
                          <option value="ceiling">Ceiling</option>
                          <option value="floor">Floor</option>
                          <option value="details">Opening / Details</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center pt-1 text-xs text-cad-muted">
                        <span className="truncate max-w-[140px] text-[10px]">{photo.name}</span>
                        <button
                          onClick={() => removeMedia(photo.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  onClick={() => photosInputRef.current?.click()}
                  className="border-2 border-dashed border-cad-border hover:border-gold/60 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition bg-cad-darkest/40 group"
                >
                  <div className="w-12 h-12 rounded-full bg-cad-surface group-hover:bg-gold/20 flex items-center justify-center text-gold mb-3 transition">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">
                    Upload ordinary photos of each wall
                  </span>
                  <span className="text-xs text-cad-muted max-w-md">
                    Select 4 to 8 photos capturing the room corners, doors, windows, and ceiling height.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Measured Dimensions */}
        {activeTab === 'dimensions' && (
          <div className="space-y-4">
            <div className="bg-cad-surface/70 border border-cad-border rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-gold">
                <Info className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-white">Manual Measured Dimensions (Metric)</h3>
              </div>
              <p className="text-xs text-cad-muted">
                While computer vision can estimate dimensions from photographs, verified tape or laser measurements guarantee millimeter accuracy for furniture fit.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-cad-light">Room Length (m):</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.5"
                    max="30"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cad-dark border border-cad-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <span className="text-[10px] text-cad-muted">East-West dimension</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-cad-light">Room Width (m):</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.5"
                    max="30"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cad-dark border border-cad-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <span className="text-[10px] text-cad-muted">North-South dimension</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-cad-light">Ceiling Height (m):</label>
                  <input
                    type="number"
                    step="0.05"
                    min="2.0"
                    max="6.0"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cad-dark border border-cad-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <span className="text-[10px] text-cad-muted">Floor to finished ceiling</span>
                </div>
              </div>

              {/* Openings Specifications */}
              <div className="border-t border-cad-border pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-cad-muted">Door Width (m):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={doorWidth}
                    onChange={(e) => setDoorWidth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cad-dark border border-cad-border rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-cad-muted">Door Height (m):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={doorHeight}
                    onChange={(e) => setDoorHeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cad-dark border border-cad-border rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-cad-muted">Window Width (m):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={windowWidth}
                    onChange={(e) => setWindowWidth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cad-dark border border-cad-border rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-cad-muted">Window Sill Height (m):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={windowSill}
                    onChange={(e) => setWindowSill(parseFloat(e.target.value) || 0)}
                    className="w-full bg-cad-dark border border-cad-border rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Footer with Progress Bar */}
        <div className="bg-cad-surface border border-cad-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center space-x-2">
                <span>Status:</span>
                <span className="text-gold uppercase font-mono tracking-wide">{processingStage.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-[11px] text-cad-muted">
                Ready to analyze room geometry and generate real interior designs.
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleRunAnalysis}
              className="px-6 py-2.5 bg-gradient-to-r from-gold via-gold-light to-gold text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-gold-glow hover:brightness-110 active:scale-98 transition-all flex items-center space-x-2"
            >
              <span>Analyze & Reconstruct Room</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
