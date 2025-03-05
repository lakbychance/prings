import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './ui/dialog';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    isOpen: boolean;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel, isOpen }) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Reset crop and zoom when a new image is loaded
    useEffect(() => {
        if (isOpen) {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        }
    }, [image, isOpen]);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        // Set canvas size to match the cropped area
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // Draw the cropped image onto the canvas
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        // Return as a data URL
        return canvas.toDataURL('image/jpeg');
    };

    const handleCropImage = async () => {
        if (!croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error('Error cropping image:', e);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent
                className="skeuo-card p-0 bg-zinc-900 shadow-xl overflow-hidden"
                style={{
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    border: "2px solid #27272a",
                    width: "95%",
                    maxWidth: "500px"
                }}
            >
                <div className="p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Crop Profile Picture</DialogTitle>
                        <DialogDescription className="mt-1">
                            Drag to position and use the slider to zoom. The image will be cropped to a square.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative h-60 sm:h-80 w-full mb-6 rounded-md overflow-hidden border border-zinc-700 shadow-inner">
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={onCropChange}
                            onZoomChange={onZoomChange}
                            onCropComplete={onCropCompleteCallback}
                            cropShape="round"
                            showGrid={false}
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-zinc-300" style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.8)" }}>Zoom</span>
                            <span className="text-sm text-zinc-400">{zoom.toFixed(1)}x</span>
                        </div>
                        <div
                            className="skeuo-slider-track relative h-2.5 rounded-full"
                            style={{
                                background: "linear-gradient(to bottom, #27272a 0%, #3f3f46 100%)",
                                boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.3)"
                            }}
                        >
                            <div
                                className="skeuo-slider-range absolute h-full rounded-full"
                                style={{
                                    width: `${((zoom - 1) / 2) * 100}%`,
                                    background: "linear-gradient(to bottom, #4CAF50 0%, #3e8e41 100%)",
                                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                                }}
                            ></div>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="skeuo-slider-thumb absolute top-1/2 w-6 h-6 rounded-full"
                                style={{
                                    left: `calc(${((zoom - 1) / 2) * 100}%)`,
                                    transform: 'translateX(-50%) translateY(-50%)',
                                    background: "linear-gradient(to bottom, #52525b 0%, #3f3f46 100%)",
                                    border: "1px solid #18181b",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(82, 82, 91, 0.8)"
                                }}
                            ></div>
                        </div>
                    </div>

                    <DialogFooter className="sm:space-x-3">
                        <button
                            onClick={onCancel}
                            className="skeuo-button py-2 px-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCropImage}
                            className="skeuo-button py-2 px-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 w-full sm:w-auto mt-2 sm:mt-0"
                        >
                            Apply Crop
                        </button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropper; 