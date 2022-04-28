import type { NextPage } from "next";
import { ChangeEvent, useEffect, useReducer, useRef, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import * as Popover from "@radix-ui/react-popover";
import clsx from 'clsx'

import { HexColorPicker } from "react-colorful";

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
}

interface ProfileRingAction {
  type:
  | "CHANGE_PROFILE_RING_TEXT"
  | "CHANGE_PROFILE_RING_TEXT_COLOR"
  | "CHANGE_PROFILE_RING_TEXT_FONT_SIZE"
  | "CHANGE_PROFILE_RING_TEXT_START_OFFSET"
  | "CHANGE_PROFILE_RING_COLOR"
  | "CHANGE_PROFILE_RING_FADE_COLOR";
  payload: any;
}

const profileRingReducer = (
  state: ProfileRingState,
  action: ProfileRingAction
) => {
  const type = action.type;
  switch (type) {
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
  const [profilePicUrl, setProfilePicUrl] = useState("/defaultProfilePic.png");
  const [profilePicDimensions, setProfilePicDimensions] = useState({
    width: 0,
    height: 0,
  });

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
    },
    profileRingDispatch,
  ] = useReducer(profileRingReducer, {
    profileRingText: "#Bought Twitter",
    profileRingTextColor: "#FFFFFF",
    profileRingTextFontSize: 2.25,
    profileRingTextStartOffset: 2,
    profileRingColor: "#54873C",
    profileRingFadeColor: "#000000",
  });

  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const profilePicRef = useRef<HTMLImageElement>(null);
  const profileRingSVGRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onProfilePicUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target?.files?.[0];
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const profilePicUrl = event.target?.result?.toString();
      if (profilePicUrl) setProfilePicUrl(profilePicUrl);
    };

    if (uploadedFile) fileReader.readAsDataURL(uploadedFile);
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

  useEffect(() => {
    if (profilePicRef.current) {
      setProfilePicDimensions({
        width: profilePicRef.current.width,
        height: profilePicRef.current.height,
      });
    }
  }, [profilePicRef.current]);

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

  const profilePicWidth = profilePicDimensions.width;
  const profilePicHeight = profilePicDimensions.height;
  const profileRingOffset = profilePicWidth / 2 - 26.25;
  const isDownloading = downloadStatusState.pending;

  return (
    <>
      <header className="flex bg-gray-800">
        <h1 className="text-gray-300 bg-gray-900 bg-opacity-60 text-center text-3xl py-2 mt-2 w-11/12 mx-auto rounded-2xl relative container max-w-md">Prings</h1>
      </header>
      <main
        className="min-h-screen py-6 px-10 bg-gray-800"
      >
        <section className="relative container flex max-w-md mx-auto flex-col items-center justify-center">

          <img
            ref={profilePicRef}
            src={profilePicUrl}
            className="rounded-full aspect-square w-80 h-80 object-cover"
            style={{ minWidth: '20rem' }}
          />

          <svg
            ref={profileRingSVGRef}
            width={profilePicWidth}
            height={profilePicHeight}
            className={clsx("absolute top-0", profilePicWidth ? 'visible' : 'invisible')}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            fontSize={`${profileRingTextFontSize}rem`}
          >
            <defs>
              <linearGradient
                id="profileRingGradient"
                x1="195"
                y1="260"
                x2="234"
                y2="197"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={profileRingColor} />
                <stop
                  offset="1"
                  stopColor={profileRingFadeColor}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            <path
              d={`M ${profilePicWidth / 2} ${profilePicWidth / 2}
    m -${profileRingOffset}, 0
    a ${profileRingOffset},${profileRingOffset} 0 1,0 ${profileRingOffset * 2},0
    a ${profileRingOffset},${profileRingOffset} 0 1,0 -${profileRingOffset * 2
                },0`}
              id="profileRingTextPath"
              fill="none"
              stroke="url(#profileRingGradient)"
              strokeWidth="52.5"
            />
            <text dy="0.3em" fontSize="1em">
              <textPath
                style={{
                  lineHeight: "2.5rem",
                  fontWeight: "700",
                  fill: profileRingTextColor,
                  letterSpacing: "2.4px",
                  fontFamily: "sans-serif",
                }}
                xlinkHref="#profileRingTextPath"
                startOffset={`${profileRingTextStartOffset}%`}
              >
                {profileRingText}
              </textPath>
            </text>
          </svg>
          <input
            className="my-2 w-full"
            type="file"
            accept="image/*"
            onChange={onProfilePicUpload}
          />
          <input
            className="my-2 px-4 py-2.5 bg-transparent border-4 font-semibold text-gray-400 border-gray-600 w-full rounded-2xl"
            value={profileRingText}
            placeholder="Enter Profile Ring Text..."
            onChange={onProfileRingTextChange}
          />
          <div className="flex justify-between my-2 w-full">
            <div className="flex flex-wrap gap-1">
              <label className="flex items-center bg-gray-700 px-2 sm:px-4 rounded-full">
                {" "}
                <span className="mx-1 text-sm text-green-300 font-semibold">Ring</span>{" "}
                <input
                  type="radio"
                  name="profileRingColors"
                  value="profileRingColor"
                  checked={selectedColorOption.ring}
                  onChange={() => selectedColorDispatch({ type: "RING" })}
                />
              </label>
              <label className="flex items-center bg-gray-700 px-2 sm:px-4 rounded-full">
                <span className="mx-1 text-sm text-green-300 font-semibold">Fade</span>
                <input
                  type="radio"
                  name="profileRingColors"
                  value="profileRingFadeColor"
                  checked={selectedColorOption.fade}
                  onChange={() => selectedColorDispatch({ type: "FADE" })}
                />
              </label>
              <label className="flex items-center bg-gray-700 px-2 sm:px-4 rounded-full">
                <span className="mx-1 text-sm text-green-300 font-semibold">Text</span>
                <input
                  type="radio"
                  name="profileRingColors"
                  value="profileRingTextColor"
                  checked={selectedColorOption.text}
                  onChange={() => selectedColorDispatch({ type: "TEXT" })}
                />
              </label>
            </div>
            <Popover.Root>
              <Popover.Trigger className="p-4 rounded-lg border-white border-2" style={{
                backgroundColor: selectedColorOption.ring
                  ? profileRingColor
                  : selectedColorOption.fade
                    ? profileRingFadeColor
                    : profileRingTextColor,
              }}>
              </Popover.Trigger>
              <Popover.Content>
                <HexColorPicker
                  color={profileRingFadeColor}
                  onChange={onChangeColors}
                />
                ;
              </Popover.Content>
            </Popover.Root>
          </div>
          <div className="w-full mt-2">
            <label className="font-semibold text-gray-200">Change text size</label>
            <Slider.Root
              className="relative flex items-center w-full h-4 touch-none select-none"
              value={[profileRingTextFontSize]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value: number[]) =>
                profileRingDispatch({
                  type: "CHANGE_PROFILE_RING_TEXT_FONT_SIZE",
                  payload: value,
                })
              }
              disabled={!profileRingText}
            >
              <Slider.Track className="relative bg-gray-700 flex-grow rounded-full h-2">
                <Slider.Range className="absolute bg-green-300 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="w-6 h-6 bg-red-400 rounded-full block" />
            </Slider.Root>
          </div>
          <div className="mt-2 w-full">
            <label className="font-semibold text-gray-200">Change text position</label>
            <Slider.Root
              className="relative flex items-center w-full h-4 touch-none select-none"
              value={[profileRingTextStartOffset]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value: number[]) =>
                profileRingDispatch({
                  type: "CHANGE_PROFILE_RING_TEXT_START_OFFSET",
                  payload: value,
                })
              }
              disabled={!profileRingText}
            >
              <Slider.Track className="relative bg-gray-700 flex-grow rounded-full h-2">
                <Slider.Range className="absolute bg-green-300 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="w-6 h-6 bg-red-400 rounded-full block" />
            </Slider.Root>
          </div>
          <button
            className={clsx("px-4 py-2 mt-4 w-9/12 bg-gray-700 bg-opacity-70 text-green-300 font-semibold rounded-full disabled:bg-gray-400 disabled:text-gray-200", isDownloading && "animate-pulse")}
            disabled={!profileRingText || isDownloading}
            onClick={onDownloadProfilePic}
          >
            {!isDownloading ? 'Download' : '◉  ◉  ◉'}
          </button>
          <a hidden target='_blank' ref={downloadLinkRef} />
        </section>
        <canvas hidden ref={canvasRef} />
      </main>
    </>
  );
};

export default Home;
