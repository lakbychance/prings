import type { NextPage } from "next";
import { ChangeEvent, useEffect, useReducer, useRef, useState } from "react";
import { Pipette } from 'lucide-react'
import { HexColorPicker } from "react-colorful";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { ProfileRing } from "../components/ProfileRing";
import ImageCropper from "../components/ImageCropper";
import { cn } from "../lib/utils";
import { useMedia } from 'react-use';

function fit(contains: boolean) {
  return (
    parentWidth: number,
    parentHeight: number,
    childWidth: number,
    childHeight: number,
    scale = 1,
    offsetX = 0.5,
    offsetY = 0.5
  ) => {
    const childRatio = childWidth / childHeight;
    const parentRatio = parentWidth / parentHeight;
    let width = parentWidth * scale;
    let height = parentHeight * scale;

    if (contains ? childRatio > parentRatio : childRatio < parentRatio) {
      height = width / childRatio;
    } else {
      width = height * childRatio;
    }

    return {
      width,
      height,
      offsetX: (parentWidth - width) * offsetX,
      offsetY: (parentHeight - height) * offsetY,
    };
  };
}

const cover = fit(false);

interface ProfileRingState {
  profileRingText: string;
  profileRingTextColor: string;
  profileRingTextFontSize: number;
  profileRingTextStartOffset: number;
  profileRingColor: string;
  profileRingFadeColor: string;
  profileRingFontFamily: string;
}

interface ProfileRingAction {
  type:
  | "CHANGE_PROFILE_RING_TEXT"
  | "CHANGE_PROFILE_RING_TEXT_COLOR"
  | "CHANGE_PROFILE_RING_TEXT_FONT_SIZE"
  | "CHANGE_PROFILE_RING_TEXT_START_OFFSET"
  | "CHANGE_PROFILE_RING_COLOR"
  | "CHANGE_PROFILE_RING_FADE_COLOR"
  | "CHANGE_PROFILE_RING_FONT_FAMILY";
  payload: any;
}

const profileRingReducer = (
  state: ProfileRingState,
  action: ProfileRingAction
) => {
  switch (action.type) {
    case "CHANGE_PROFILE_RING_TEXT": {
      return { ...state, profileRingText: action.payload };
    }
    case "CHANGE_PROFILE_RING_TEXT_COLOR": {
      return { ...state, profileRingTextColor: action.payload };
    }
    case "CHANGE_PROFILE_RING_TEXT_FONT_SIZE": {
      return { ...state, profileRingTextFontSize: action.payload };
    }
    case "CHANGE_PROFILE_RING_TEXT_START_OFFSET": {
      return { ...state, profileRingTextStartOffset: action.payload };
    }
    case "CHANGE_PROFILE_RING_COLOR": {
      return { ...state, profileRingColor: action.payload };
    }
    case "CHANGE_PROFILE_RING_FADE_COLOR": {
      return { ...state, profileRingFadeColor: action.payload };
    }
    case "CHANGE_PROFILE_RING_FONT_FAMILY": {
      return { ...state, profileRingFontFamily: action.payload };
    }
    default:
      return state;
  }
};

interface SelectedColorOptionAction {
  type: "RING" | "FADE" | "TEXT";
}

interface SelectedColorOptionState {
  ring: boolean;
  fade: boolean;
  text: boolean;
}

const selectedColorOptionReducer = (
  state: SelectedColorOptionState,
  action: SelectedColorOptionAction
) => {
  const type = action.type.toLowerCase();
  const newSelectedColorOptionState = { ...state };
  Object.keys(newSelectedColorOptionState).forEach((key) => {
    (newSelectedColorOptionState as Record<string, boolean>)[key] = key === type;
  })
  return newSelectedColorOptionState;
};

interface DownloadStatusAction {
  type: "IDLE" | "PENDING" | "RESOLVED" | "ERROR";
}

interface DownloadStatusState {
  idle: boolean;
  pending: boolean;
  resolved: boolean;
  error: boolean;
}


const downloadStatusReducer = (
  state: DownloadStatusState,
  action: DownloadStatusAction
) => {
  const type = action.type.toLowerCase();
  const newDownloadStatusState = { ...state };
  Object.keys(newDownloadStatusState).forEach((key) => {
    (newDownloadStatusState as Record<string, boolean>)[key] = key === type;
  })
  return newDownloadStatusState;
};

const Home: NextPage = () => {
  const [profilePicUrl, setProfilePicUrl] = useState<string>("/defaultProfilePic.png");
  const [profilePicDimensions, setProfilePicDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isImageColorPickerMode, setIsImageColorPickerMode] = useState<boolean>(false);
  const isMobileDevice = useMedia('(max-width: 768px)');

  const [selectedColorOption, selectedColorDispatch] = useReducer(
    selectedColorOptionReducer,
    { ring: true, fade: false, text: false }
  );

  const [downloadStatusState, downloadStatusDispatch] = useReducer(downloadStatusReducer, {
    idle: true,
    pending: false,
    resolved: false,
    error: false,
  })

  const [
    {
      profileRingText,
      profileRingTextColor,
      profileRingTextFontSize,
      profileRingTextStartOffset,
      profileRingColor,
      profileRingFadeColor,
      profileRingFontFamily,
    },
    profileRingDispatch,
  ] = useReducer(profileRingReducer, {
    profileRingText: "#Bought Twitter",
    profileRingTextColor: "#FFFFFF",
    profileRingTextFontSize: 2.25,
    profileRingTextStartOffset: 2,
    profileRingColor: "#54873C",
    profileRingFadeColor: "#000000",
    profileRingFontFamily: "'Inter', sans-serif",
  });

  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const profilePicRef = useRef<HTMLImageElement>(null);
  const profileRingSVGRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageColorPickerCanvasRef = useRef<HTMLCanvasElement>(null);
  const profilePicContainerRef = useRef<HTMLDivElement>(null);
  const colorPreviewRef = useRef<HTMLDivElement>(null);
  const colorSwatchRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  const onProfilePicUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target?.files?.[0];
    if (!uploadedFile) return;

    // Don't set loading state when initially selecting an image
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const profilePicUrl = event.target?.result?.toString();
      if (profilePicUrl) {
        setImageToEdit(profilePicUrl);
        setShowCropper(true);
      }
    };

    fileReader.readAsDataURL(uploadedFile);
  };

  const handleCropComplete = async (croppedImage: string) => {
    // Set loading state only when applying the cropped image
    setIsImageLoading(true);
    setProfilePicUrl(croppedImage);
    setShowCropper(false);
    setImageToEdit(null);

    // Reset dimensions to trigger recalculation when the new image loads
    setProfilePicDimensions({
      width: 0,
      height: 0,
    });

    // Small delay to ensure the UI updates
    setTimeout(() => {
      setIsImageLoading(false);
    }, 300);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToEdit(null);
    setIsImageLoading(false);

    // Reset the file input
    const fileInput = document.getElementById('profile-pic') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onProfileRingTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const profileRingText = e.target.value;
    profileRingDispatch({
      type: "CHANGE_PROFILE_RING_TEXT",
      payload: profileRingText,
    });
  };

  const onDownloadProfilePic = () => {
    downloadStatusDispatch({ type: 'PENDING' });
    const profileRingSVG = profileRingSVGRef.current;
    let profileRingSVGHTML = profileRingSVG?.outerHTML;
    if (profileRingSVGHTML) {
      const profileRingSVGBlob = new Blob([profileRingSVGHTML], { type: 'image/svg+xml' });
      const profileRingSVGURL = URL.createObjectURL(profileRingSVGBlob);
      const profileRingSVGImage = new window.Image();
      const profilePic = profilePicRef.current;
      let minimumProfilePicSize = 800;
      if (profilePic) {
        minimumProfilePicSize = Math.min(profilePic.naturalHeight, profilePic.naturalWidth, minimumProfilePicSize);
      }
      profileRingSVGImage.addEventListener('load', () => {
        URL.revokeObjectURL(profileRingSVGURL)
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = minimumProfilePicSize * devicePixelRatio;
          canvas.height = minimumProfilePicSize * devicePixelRatio;
          canvas.style.width = `${profilePicDimensions.width}px`
          canvas.style.height = `${profilePicDimensions.height}px`

          const { offsetX, offsetY, width, height } = cover(
            minimumProfilePicSize,
            minimumProfilePicSize,
            Number(profilePic?.naturalWidth),
            Number(profilePic?.naturalHeight)
          );

          let context = canvas.getContext("2d");
          if (context) {
            if (profilePic)
              context.drawImage(
                profilePic,
                offsetX * devicePixelRatio,
                offsetY * devicePixelRatio,
                devicePixelRatio * width,
                devicePixelRatio * height
              );
            context.drawImage(
              profileRingSVGImage,
              0,
              0,
              minimumProfilePicSize * devicePixelRatio,
              minimumProfilePicSize * devicePixelRatio
            );
          };
          var downloadLink = downloadLinkRef.current;
          setTimeout(() => {
            downloadLink?.setAttribute("download", `prings.png`);
            downloadLink?.setAttribute(
              "href",
              canvas
                .toDataURL("image/webp", 1)
                .replace("image/webp", "image/octet-stream"));
            downloadLink?.click();
            downloadStatusDispatch({ type: 'RESOLVED' })
          }, 100)
        }
      }, { once: true })
      profileRingSVGImage.src = profileRingSVGURL;
    }
  };

  const onChangeColors = (color: string) => {
    let profileRingActionType: any = null;
    if (selectedColorOption.ring) {
      profileRingActionType = "CHANGE_PROFILE_RING_COLOR";
    }
    if (selectedColorOption.fade) {
      profileRingActionType = "CHANGE_PROFILE_RING_FADE_COLOR";
    }
    if (selectedColorOption.text) {
      profileRingActionType = "CHANGE_PROFILE_RING_TEXT_COLOR";
    }
    profileRingDispatch({
      type: profileRingActionType,
      payload: color,
    });
  };

  const getColorAtPosition = (x: number, y: number): string => {
    const canvas = imageColorPickerCanvasRef.current;
    if (!canvas) return '#000000';

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '#000000';

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    // Ensure each color component is properly padded with leading zeros
    const r = pixelData[0].toString(16).padStart(2, '0');
    const g = pixelData[1].toString(16).padStart(2, '0');
    const b = pixelData[2].toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const updateColorPreview = (x: number, y: number) => {
    const container = profilePicContainerRef.current;
    const preview = colorPreviewRef.current;
    const swatch = colorSwatchRef.current;

    if (!container || !preview || !swatch) return;

    const rect = container.getBoundingClientRect();

    // Check if the point is within the circular area
    // The profile picture is a circle in the center of the container
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = rect.width / 2; // For a perfect circle, radius is exactly half the width

    // Calculate distance from center in screen coordinates
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    // If outside the circle, hide the preview and return
    if (distanceFromCenter > radius) {
      preview.style.display = 'none';
      return;
    }

    // Calculate the position relative to the canvas
    const canvas = imageColorPickerCanvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Since canvas now matches the display dimensions, the scaling is 1:1
    const canvasX = Math.floor(x);
    const canvasY = Math.floor(y);

    if (canvasX >= 0 && canvasX < canvasWidth && canvasY >= 0 && canvasY < canvasHeight) {
      const color = getColorAtPosition(canvasX, canvasY);

      // Update the preview directly using the refs
      preview.style.display = 'flex';
      preview.style.left = `${x + 15}px`;
      preview.style.top = `${y + 15}px`;

      swatch.style.backgroundColor = color;
    }
  };

  const handleImageColorPickerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isImageColorPickerMode || isMobileDevice) return;

    const container = profilePicContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Store the position for use in the animation frame
    lastPositionRef.current = { x, y };

    // Cancel any existing animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule the update on the next animation frame
    rafRef.current = requestAnimationFrame(() => {
      if (lastPositionRef.current) {
        updateColorPreview(lastPositionRef.current.x, lastPositionRef.current.y);
      }
      rafRef.current = null;
    });
  };

  const handleImageColorPickerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isImageColorPickerMode) return;

    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const container = profilePicContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if the point is within the circular area
    // The profile picture is a circle in the center of the container
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = rect.width / 2; // For a perfect circle, radius is exactly half the width

    // Calculate distance from center in screen coordinates
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    // If outside the circle, do nothing
    if (distanceFromCenter > radius) {
      return;
    }

    // Calculate the position relative to the canvas
    const canvas = imageColorPickerCanvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Since canvas now matches the display dimensions, the scaling is 1:1
    const canvasX = Math.floor(x);
    const canvasY = Math.floor(y);

    if (canvasX >= 0 && canvasX < canvasWidth && canvasY >= 0 && canvasY < canvasHeight) {
      const color = getColorAtPosition(canvasX, canvasY);

      // Apply the selected color
      onChangeColors(color);
      setIsImageColorPickerMode(false);

      // Hide the preview
      if (colorPreviewRef.current) {
        colorPreviewRef.current.style.display = 'none';
      }

      // Reset position ref
      lastPositionRef.current = null;
    }
  };

  // Setup the canvas for color picking when the mode is enabled
  useEffect(() => {
    if (isImageColorPickerMode && profilePicRef.current) {
      const canvas = imageColorPickerCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const img = profilePicRef.current;
      // Set canvas dimensions to match the DISPLAY dimensions of the image
      // This ensures the coordinate systems are consistent
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image to the canvas, scaling it to fit the canvas dimensions
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);
    }
  }, [isImageColorPickerMode, isMobileDevice]);

  // Toggle image color picker mode
  const toggleImageColorPickerMode = () => {
    setIsImageColorPickerMode(!isImageColorPickerMode);
    if (!isImageColorPickerMode) {
      // Reset hover state when enabling
      if (colorPreviewRef.current) {
        colorPreviewRef.current.style.display = 'none';
      }
    }
  };

  useEffect(() => {
    const onWindowResize = () => {
      const profilePic = profilePicRef.current;
      if (profilePic)
        setProfilePicDimensions({
          width: profilePic.width,
          height: profilePic.height,
        });
    };
    window.addEventListener("resize", onWindowResize);
    return () => window.removeEventListener("resize", onWindowResize);
  }, []);


  const isDownloading = downloadStatusState.pending;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <main className="container sm:py-8 px-0 sm:px-4">
        <div className="skeuo-card mx-0 sm:mx-auto sm:max-w-md w-full">

          <div className="space-y-6">
            <div className="flex justify-center">
              <div
                className="relative"
                ref={profilePicContainerRef}
                onMouseMove={handleImageColorPickerMouseMove}
                onClick={handleImageColorPickerClick}
                onMouseLeave={() => {
                  if (colorPreviewRef.current) {
                    colorPreviewRef.current.style.display = 'none';
                  }
                  // Cancel any pending animation frame
                  if (rafRef.current !== null) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = null;
                  }
                  lastPositionRef.current = null;
                }}

                style={{ cursor: isImageColorPickerMode ? 'crosshair' : 'default' }}
              >
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-50 rounded-full z-10">
                    <div className="w-12 h-12 border-4 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"></div>
                  </div>
                )}
                {isImageColorPickerMode && (
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 z-10 pointer-events-none">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {isMobileDevice ? "Tap to pick a color" : "Click to pick a color"}
                    </div>
                  </div>
                )}
                <ProfileRing
                  profilePicUrl={profilePicUrl}
                  profileRingText={profileRingText}
                  profileRingTextColor={profileRingTextColor}
                  profileRingTextFontSize={profileRingTextFontSize}
                  profileRingTextStartOffset={profileRingTextStartOffset}
                  profileRingColor={profileRingColor}
                  profileRingFadeColor={profileRingFadeColor}
                  profileRingFontFamily={profileRingFontFamily}
                  profileRingSVGRef={profileRingSVGRef}
                  profilePicRef={profilePicRef}
                />

                <div
                  ref={colorPreviewRef}
                  style={{
                    position: 'absolute',
                    display: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      ref={colorSwatchRef}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-pic" className="block mb-2 font-semibold text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Upload Profile Picture</Label>
                <div className="p-0 overflow-hidden transition-all">
                  <label className="skeuo-button py-2 px-4 inline-flex items-center justify-center cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Profile Picture
                    <Input
                      id="profile-pic"
                      type="file"
                      accept="image/*"
                      onChange={onProfilePicUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="ring-text" className="block mb-1 sm:mb-2 font-semibold text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Ring Text</Label>
                <Input
                  id="ring-text"
                  type="text"
                  className="skeuo-input"
                  value={profileRingText}
                  onChange={onProfileRingTextChange}
                  placeholder="Enter text for the ring"
                />
              </div>

              <div>
                <Label htmlFor="font-family" className="block mb-1 sm:mb-2 font-semibold text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Font Style</Label>
                <select
                  id="font-family"
                  className="skeuo-input w-full h-10 px-3 py-2 rounded-md"
                  value={profileRingFontFamily}
                  onChange={(e) => profileRingDispatch({
                    type: "CHANGE_PROFILE_RING_FONT_FAMILY",
                    payload: e.target.value,
                  })}
                >
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                  <option value="Impact, sans-serif">Impact</option>
                  <option value="'Lucida Console', monospace">Lucida Console</option>
                  <option value="'Palatino Linotype', serif">Palatino Linotype</option>
                </select>
              </div>

              <div>
                <Label className="block mb-2 font-semibold text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Color Selection</Label>
                <div className="flex items-center justify-between mt-2 p-4 rounded-lg bg-zinc-800 border border-zinc-900 shadow-sm">
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="ring"
                        name="colorOption"
                        className="skeuo-radio"
                        checked={selectedColorOption.ring}
                        onChange={() => selectedColorDispatch({ type: "RING" })}
                      />
                      <Label htmlFor="ring" className="font-medium text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Ring</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="fade"
                        name="colorOption"
                        className="skeuo-radio"
                        checked={selectedColorOption.fade}
                        onChange={() => selectedColorDispatch({ type: "FADE" })}
                      />
                      <Label htmlFor="fade" className="font-medium text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Fade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="text"
                        name="colorOption"
                        className="skeuo-radio"
                        checked={selectedColorOption.text}
                        onChange={() => selectedColorDispatch({ type: "TEXT" })}
                      />
                      <Label htmlFor="text" className="font-medium text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Text</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className={cn(
                        "color-picker-button w-10 h-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900",
                      )}
                      onClick={toggleImageColorPickerMode}
                      title={isImageColorPickerMode ? "Cancel color picking" : "Pick color from image"}
                    >
                      <Pipette className={cn(
                        "w-6 h-6 mx-auto",
                        isImageColorPickerMode && "text-green-500"
                      )} />
                    </button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-10 h-10 rounded-md border border-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 transition-shadow"
                          style={{
                            backgroundColor: selectedColorOption.ring
                              ? profileRingColor
                              : selectedColorOption.fade
                                ? profileRingFadeColor
                                : profileRingTextColor,
                            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)"
                          }}
                          onFocus={(e) => {
                            e.currentTarget.setAttribute('data-focused', 'true');
                          }}
                          onBlur={(e) => {
                            e.currentTarget.removeAttribute('data-focused');
                          }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3 shadow-lg border border-zinc-900 bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900">
                        <HexColorPicker
                          color={
                            selectedColorOption.ring
                              ? profileRingColor
                              : selectedColorOption.fade
                                ? profileRingFadeColor
                                : profileRingTextColor
                          }
                          onChange={onChangeColors}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="text-size" className="font-semibold text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Text Size</Label>
                </div>
                <div className="px-1 py-3">
                  <div className="skeuo-slider-track relative">
                    <div
                      className="skeuo-slider-range absolute h-full rounded-full"
                      style={{ width: `${((profileRingTextFontSize - 1) / 2) * 100}%` }}
                    ></div>
                    <Slider
                      id="text-size"
                      value={[profileRingTextFontSize]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={(value: number[]) =>
                        profileRingDispatch({
                          type: "CHANGE_PROFILE_RING_TEXT_FONT_SIZE",
                          payload: value[0],
                        })
                      }
                      disabled={!profileRingText}
                      className="relative z-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="text-position" className="font-semibold text-zinc-200" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Text Position</Label>
                </div>
                <div className="px-1 py-3">
                  <div className="skeuo-slider-track relative">
                    <div
                      className="skeuo-slider-range absolute h-full rounded-full"
                      style={{ width: `${profileRingTextStartOffset}%` }}
                    ></div>
                    <Slider
                      id="text-position"
                      value={[profileRingTextStartOffset]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value: number[]) =>
                        profileRingDispatch({
                          type: "CHANGE_PROFILE_RING_TEXT_START_OFFSET",
                          payload: value[0],
                        })
                      }
                      disabled={!profileRingText}
                      className="relative z-10"
                    />
                  </div>
                </div>
              </div>

              <button
                className={cn(
                  "skeuo-button w-full py-3 px-4 mt-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900",
                  !profileRingText || isDownloading ? "opacity-50 cursor-not-allowed" : ""
                )}
                disabled={!profileRingText || isDownloading}
                onClick={onDownloadProfilePic}
              >
                {!isDownloading ? 'Download' : 'Processing...'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <a hidden target='_blank' ref={downloadLinkRef} />
      <canvas hidden ref={canvasRef} />
      <canvas hidden ref={imageColorPickerCanvasRef} />

      {imageToEdit && (
        <ImageCropper
          image={imageToEdit}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isOpen={showCropper}
        />
      )}
    </div>
  );
};

export default Home;
