"use client"
import React, { useEffect, useState } from 'react'
import PlaygroundHeader from '../_components/PlaygroundHeader'
import ChatSection from '../_components/ChatSection'
import WebSiteDesign from '../_components/WebSiteDesign'
import ElementSettingSection from '../_components/ElementSettingSection'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'

export type Frame={
    projectId:string,
    frameId:string,
    designCode:string,
    chatMessage:Messages[],
}

export type Messages={
        role:string,
        content:string
    }

const Prompt:string=`
userInput: {userInput}

Instructions:

If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., “create a landing page”, “build a dashboard”, “generate HTML Tailwind CSS code”), then:

Generate a complete HTML Tailwind CSS code using Flowbite UI components.

Use a modern design with blue as the primary color theme.

Only include the <body> content (do not add <head> or <title>).

Make it fully responsive for all screen sizes.

All primary components must match the theme color.

Add proper padding and margin for each element.

Components should be independent; do not connect them.

Use placeholders for all images:
Light mode:
https://community-cdn-dsfdr.fot/app/uploads/db110e/original/2X/7/746e0e8522ffd5f09775ac9a7e6f6817b81a60a8.jpeg
Dark mode:
https://www.cabsky.com/wp-content/uploads/2015/12/placeholder-3.jpg

Add alt tags describing the image prompt.

Use the following libraries/components where appropriate:

FontAwesome icons (fa-*)

Flowbite UI components: buttons, modals, forms, tables, tabs, alerts, cards, dialogs, dropdowns, accordions, etc.

Chart.js for charts & graphs

Swiper.js for sliders/carousels

Tippy.js for tooltips & popovers

Include interactive components like modals, dropdowns, and accordions.

Ensure proper spacing, alignment, hierarchy, and theme consistency.

Ensure charts are visually appealing and match the theme color.

Header menu options should be spread out and not bunched.

Do not include broken links.

Do not add any extra text before or after the HTML code.

If the user input is general text or greetings (e.g., “Hi”, “Hello”, “How are you?”) and does not explicitly ask to generate code, then:

Respond with a simple, friendly text message instead of generating code.

Example:

User: “Hi” → Response: “Hello! How can I help you?”

User: “Build a responsive landing page with Tailwind CSS” → Response: “Generate full HTML code as per instructions above.”
`


const PlayGround = () => {
    const {projectId}=useParams();
    const params=useSearchParams();
    const frameId=params.get('frameId');
    const [frameDetail,setFrameDetail]=useState<Frame>();
    const [loading,setLoading]=useState<boolean>(false);
    const [messages,setMessages]=useState<Messages[]>([]);
    const [generatedCode,setGeneratedCode]=useState<any>();
    
    useEffect(()=>{
        GetFrameDetails();
    },[frameId])
    
    const GetFrameDetails=async()=>{
        const result=await axios.get('/api/frames?frameId='+frameId+'&projectId='+projectId);
        setFrameDetail(result.data);
        const designCode=result.data?.designCode;
        const index=designCode.indexOf('```html')+7;
        const formattedCode=designCode.slice(index);
        setGeneratedCode(formattedCode);
        if(result.data?.chatMessage?.length===1){
            const userMsg=result.data?.chatMessage[0].content;
            SendMessage(userMsg);
        }else{
            setMessages(result.data?.chatMessage);
        }
    }
    
    const SendMessage=async(userInput:string)=>{
        setLoading(true);
        // add user message to chat
        setMessages((prev:any)=>[...prev,{role:'user',content:userInput}])
        const result=await fetch('/api/ai-model',{
            method:'POST',
            body:JSON.stringify({
                messages:[{role:'user',content:Prompt?.replace('{userInput}',userInput)}]
            })
        });
        const reader=result.body?.getReader();//gives you access to that stream of chunks coming in.
        const decoder=new TextDecoder();//converts raw bytes into readable text (UTF-8).
        let aiResponse='';
        let isCode=false;

        while(true){
            // @ts-ignore
            const{done,value}=await reader?.read();
            if(done)break;
            // Each value is a Uint8Array — that’s raw binary data.
            // TextDecoder converts it to readable text (chunk).
            const chunk=decoder.decode(value,{stream:true})
            aiResponse+=chunk;
            // check if ai is start sending code 
            if(!isCode&&aiResponse.includes('```html')){
                isCode=true;
                const index=aiResponse.indexOf('```html')+7;
                const initialCodeChunk=aiResponse.slice(index);
                setGeneratedCode((prev:any)=>prev+initialCodeChunk);
            }else if(isCode){
                setGeneratedCode((prev:any)=>prev+chunk);
            }
        }   
        await SaveGeneratedCode(aiResponse);
        // after streaming ends
        if(!isCode){
            setMessages((prev:any)=>[...prev,{role:'assistant',content:aiResponse}]);
        }else{
            setMessages((prev:any)=>[...prev,{role:'assistant',content:'Your code is ready!'}])
            console.log(generatedCode);
        }
        setLoading(false);
    }

    useEffect(()=>{
       if(messages.length>0){
        SaveMessages();
       }
    },[messages])
    const SaveMessages=async()=>{
        const result=await axios.put('/api/chats',{
            messages:messages,
            frameId:frameId
        })
    }


    const SaveGeneratedCode=async(code:string)=>{
        const result = await axios.put('/api/frames',{
            designCode:code,
            frameId:frameId,
            projectId:projectId
        })
        console.log(result.data);
        toast.success('Website is Ready!')
    }

  return (
    <div>
        <PlaygroundHeader/>
        <div className='flex '>
            {/* chat section */}
            <ChatSection messages={messages??[]} onSend={(input:string)=>SendMessage(input)} loading={loading}/>
            {/* Website design */}
            <WebSiteDesign generatedCode={generatedCode}/>

            
        </div>
    </div>
  )
}

export default PlayGround