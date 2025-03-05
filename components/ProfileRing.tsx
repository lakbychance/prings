import React from 'react';
import { cn } from '../lib/utils';

interface ProfileRingProps {
    profilePicUrl: string;
    profilePicWidth: number;
    profilePicHeight: number;
    profileRingText: string;
    profileRingTextColor: string;
    profileRingTextFontSize: number;
    profileRingTextStartOffset: number;
    profileRingColor: string;
    profileRingFadeColor: string;
    profileRingFontFamily: string;
    onProfilePicLoad: (ref: HTMLImageElement) => void;
    profileRingSVGRef: React.RefObject<SVGSVGElement>;
    profilePicRef: React.RefObject<HTMLImageElement>;
}

export function ProfileRing({
    profilePicUrl,
    profilePicWidth,
    profilePicHeight,
    profileRingText,
    profileRingTextColor,
    profileRingTextFontSize,
    profileRingTextStartOffset,
    profileRingColor,
    profileRingFadeColor,
    profileRingFontFamily,
    onProfilePicLoad,
    profileRingSVGRef,
    profilePicRef,
}: ProfileRingProps) {
    const profileRingOffset = profilePicWidth / 2 - 26.25;

    return (
        <div className="relative flex items-center justify-center">
            <img
                ref={profilePicRef}
                src={profilePicUrl}
                className="rounded-full aspect-square w-80 h-80 object-cover"
                style={{ minWidth: '20rem', objectFit: 'cover' }}
                alt="Profile"
                onLoad={() => {
                    if (profilePicRef.current) {
                        onProfilePicLoad(profilePicRef.current);
                    }
                }}
            />

            <svg
                ref={profileRingSVGRef}
                width={profilePicWidth}
                height={profilePicHeight}
                className={cn("absolute top-0", profilePicWidth ? 'visible' : 'invisible')}
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
a ${profileRingOffset},${profileRingOffset} 0 1,0 -${profileRingOffset * 2},0`}
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
                            fontFamily: profileRingFontFamily || "sans-serif",
                        }}
                        xlinkHref="#profileRingTextPath"
                        startOffset={`${profileRingTextStartOffset}%`}
                    >
                        {profileRingText}
                    </textPath>
                </text>
            </svg>
        </div>
    );
} 