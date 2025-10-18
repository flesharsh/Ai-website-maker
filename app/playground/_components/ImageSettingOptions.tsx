"use client"

import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Crop,
  Expand,
  ImageUpscale, // no lucide-react upscale, using Image icon
  ImageMinus,
  Loader2Icon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from '@/components/ui/label';
import ImageKit from "imagekit";

type Props = {
  selectedEL: HTMLImageElement;
}

const transformOptions = [
  { label: "Smart Crop", value: "smartcrop", icon: <Crop/>,transformation:'fo-auto' },
  { label: "Resize", value: "resize", icon: <Expand/>,transformation:'e-dropshadow' },
  { label: "Upscale", value: "upscale", icon: <ImageUpscale/>,transformation:'e-upscale' },
  { label: "BG Remove", value: "bgremove", icon: <ImageMinus/>,transformation:'e-bgremove' },
];

const imageKit=new ImageKit({
    publicKey:process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey:process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint:process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
})

function ImageSettingsSection({ selectedEL }: Props) {

  const [altText, setAltText] = useState(selectedEL.alt || "");
  const [width, setWidth] = useState<number>(selectedEL.width || 300);
  const [height, setHeight] = useState<number>(selectedEL.height || 200);
  const [borderRadius, setBorderRadius] = useState(
    selectedEL.style.borderRadius || "8px"
  );
  const [selectedImage,setSelectedImage]=useState<File>();
  const [preview, setPreview] = useState(selectedEL.src || "");
  const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading,setLoading]=useState(false);

  // Toggle Transform
  const toggleTransform = (value: string) => {
    setActiveTransforms((prev) => {
      if (prev.includes(value)) {
        return prev.filter((t) => t !== value);
      }
      return [...prev, value];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file) {
        setSelectedImage(file)
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    
  };

  const saveUploadedFile=async()=>{
    if(selectedImage){
        setLoading(true)
        const imageRef=await imageKit.upload({
            // @ts-ignore
            file:selectedImage,
            fileName:Date.now()+'.png',
            isPublished:true
    
        })
        // @ts-ignore
        selectedEL.setAttribute('src',imageRef?.url+"?tr=")
        console.log(imageRef);
        setLoading(false);
        
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const GenerateAiImage=()=>{
    setLoading(true);
    const url=`https://ik.imagekit.io/gisud7va1m/ik-genimg-prompt-${altText}/${Date.now()}.png?tr=`
    setPreview(url);
    selectedEL.setAttribute('src',url)
    setLoading(true);
  }

    const ApplyTransformation=(trValue:string)=>{
        setLoading(true);
        const url=preview+trValue+','
        setPreview(url);
        selectedEL.setAttribute('src',url);
        setLoading(false);
    }

  return (
    <div className="w-96 shadow p-4 space-y-4">
      <h2 className="flex gap-2 items-center font-bold">
        <ImageIcon /> Image Settings
      </h2>

      {/* Preview (clickable) */}
      <div className="flex justify-center">
        <img
          src={preview}
          alt={altText}
          className="max-h-40 object-contain border rounded cursor-pointer hover:opacity-80"
          onClick={openFileDialog}
          onLoad={()=>setLoading(false)}
        />
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={saveUploadedFile}
        disabled={loading}
      >
        {loading&&<Loader2Icon className='animate-spin'/>}Upload Image
      </Button>

      {/* Alt text */}
      <div className="space-y-2">
        <Label className="text-sm">Prompt</Label>
        <Input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Enter alt text"
          className="mt-1"
        />
      </div>
      
      {/* Button className="w-full" */}
      <Button className="w-full" onClick={GenerateAiImage} disabled={loading}>
       {loading&&<Loader2Icon className='animate-spin'/>} Generate AI Image
      </Button>

      {/* Transform Buttons */}
      <div className="space-y-2">
        <Label className="text-sm mb-1 block">AI Transforms</Label>
        <div className="flex gap-2 flex-wrap">
          {transformOptions.map((opt) => {
            const applied = activeTransforms.includes(opt.value);
            return (
              <TooltipProvider key={opt.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={applied ? "default" : "outline"}
                      className="flex items-center justify-center p-2"
                      onClick={() => ApplyTransformation(opt.transformation)}
                    >
                      {opt.icon }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {opt.label} {applied && "(Applied)"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      {/* Conditional Resize Inputs */}
      {activeTransforms.includes("resize") && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-sm">Width</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label className="text-sm">Height</Label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      )}
      
      {/* Border Radius */}
      <div className="space-y-2">
        <Label className="text-sm">Border Radius</Label>
        <Input
          type="text"
          value={borderRadius}
          onChange={(e) => setBorderRadius(e.target.value)}
          placeholder="e.g. 8px or 50%"
          className="mt-1"
        />
      </div>
    </div>
  );
}

export default ImageSettingsSection;