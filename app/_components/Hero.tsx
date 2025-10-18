"use client";
import { Button } from "@/components/ui/button";
import { UserDetailContext } from "@/context/UserDetailContext";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import {
  ArrowUp,
  HomeIcon,
  ImagePlus,
  Key,
  LayoutDashboard,
  Loader2Icon,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { toast } from "sonner";
import {v4 as uuidv4} from 'uuid'

const suggestion = [
  {
    label: "Dashboard",
    prompt:
      "Create an analytics dashboard to track customers and revenue data for a SaaS",
    icon: LayoutDashboard,
  },
  {
    label: "SignUp Form",
    prompt:
      "Create a modern sign up form with email/password fields, Google and Github login options, and terms checkbox",
    icon: Key,
  },
  {
    label: "Hero",
    prompt:
      "Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a title with a subtle gradient effect, subtitle, CTA, small social proof and an image.",
    icon: HomeIcon,
  },
  {
    label: "User Profile Card",
    prompt:
      "Create a modern user profile card component for a social media website",
    icon: User,
  },
];


const Hero = () => {
  const [userInput, setUserInput] = useState<string>();
  const [loading,setLoading]=useState(false);
  const { user } = useUser();
  const router=useRouter();
  const {has}=useAuth();
  const hasUnlimitedExcess=has&&has({plan:'unlimited'});
  const {userDetail,setUserDetail}=useContext(UserDetailContext);
  
  const createNewProject=async()=>{
    if(!hasUnlimitedExcess&&userDetail?.credits<=0)
    {
      toast.error("You dont have enough credits please upgrade your plan");
      return;
    }
    const projectId=uuidv4();
    const frameId=generateRandomFrameNumber();
    const messages=[
      {
        role:'user',
        content:userInput
      }
    ]
    try {
      setLoading(true);
      const result=await axios.post('/api/projects',{
        projectId:projectId,
        frameId:frameId,
        messages:messages,
        credits:userDetail?.credits,
      })
      setUserDetail((prev:any)=>({...prev,credits:prev?.credits!-1}))
      console.log(result.data);
      toast.success('Project Created');
      // navigate to playground
      router.push(`/playground/${projectId}?frameId=${frameId}`);
      setLoading(false);
    } catch (error) {
      toast.error('Interal server error');
      console.log(error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center h-[80vh]  justify-center">
      {/* Header and description */}
      <h2 className="font-bold text-6xl">What should we design?</h2>
      <p className="mt-2 text-xl text-gray-500">
        Generate,Edit and Explore design by AI,Export code as well
      </p>

      {/* input box */}
      <div className="w-full max-w-2xl p-5 border mt-5">
        <textarea
          placeholder="Describe your page design"
          className="w-full h-24 focus:outline-none focus:ring-0"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
        ></textarea>
        <div className="flex justify-between items-center">
          <Button variant={"ghost"}>
            <ImagePlus />
          </Button>
          {!user ? (
            <SignInButton mode="modal" forceRedirectUrl={"/workspace"}>
              <Button disabled={!userInput}>
                <ArrowUp />
              </Button>
            </SignInButton>
          ) : (
            <Button disabled={!userInput||loading} onClick={createNewProject}>
              {loading?<Loader2Icon className="animate-spin"/>:<ArrowUp />}
            </Button>
          )}
        </div>
      </div>

      {/* suggestion list */}
      <div className="mt-4 flex gap-3">
        {suggestion.map((suggestion, index) => (
          <Button
            variant={"outline"}
            key={index}
            onClick={() => setUserInput(suggestion.prompt)}
          >
            <suggestion.icon />
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Hero;

const generateRandomFrameNumber=()=>{
  const num=Math.floor(Math.random()*10000);
  return num;
}

