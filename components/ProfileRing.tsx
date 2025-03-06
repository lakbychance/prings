import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProfileRingProps {
    profilePicUrl: string;
    profileRingText: string;
    profileRingTextColor: string;
    profileRingTextFontSize: number;
    profileRingTextStartOffset: number;
    profileRingColor: string;
    profileRingFadeColor: string;
    profileRingFontFamily: string;
    profileRingSVGRef: React.RefObject<SVGSVGElement>;
    profilePicRef: React.RefObject<HTMLImageElement>;
}

export function ProfileRing({
    profilePicUrl,
    profileRingText,
    profileRingTextColor,
    profileRingTextFontSize,
    profileRingTextStartOffset,
    profileRingColor,
    profileRingFadeColor,
    profileRingFontFamily,
    profileRingSVGRef,
    profilePicRef,
}: ProfileRingProps) {
    // Fixed size for both the container and SVG
    const FIXED_SIZE = 320; // 20rem = 320px (w-80 h-80)
    const profileRingOffset = FIXED_SIZE / 2 - 26.25;

    return (
        <div
            className="relative"
            style={{
                width: `${FIXED_SIZE}px`,
                height: `${FIXED_SIZE}px`
            }}
        >
            <img
                ref={profilePicRef}
                src={profilePicUrl}
                className="rounded-full absolute inset-0 w-full h-full object-cover"
                alt="Profile"
            />

            <motion.svg
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.5 }}
                ref={profileRingSVGRef}
                width={FIXED_SIZE}
                height={FIXED_SIZE}
                className="absolute inset-0"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                fontSize={`${profileRingTextFontSize}rem`}
                viewBox={`0 0 ${FIXED_SIZE} ${FIXED_SIZE}`}
                preserveAspectRatio="xMidYMid meet"
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
                    d={`M ${FIXED_SIZE / 2} ${FIXED_SIZE / 2}
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
            </motion.svg>
        </div>
    );
} 