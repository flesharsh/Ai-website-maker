// Initialize iframe shell once
//   1. iframeRef.current
// This refers to the actual <iframe> DOM element on your page (created by React’s ref).
// Example:
// <iframe></iframe>
// After React renders it, iframeRef.current gives you a JavaScript handle to that exact iframe.
// 2. iframeRef.current.contentDocument
// Every iframe has its own mini web page inside it — basically a new “document”.
// contentDocument gives you access to that internal HTML document.
// So:
// const doc = iframeRef.current.contentDocument;
// means → “Get the HTML document that lives inside my iframe”.
// 3. doc.open()
// This tells the browser:
// “I’m about to completely overwrite this iframe’s document — clear everything that’s there.”
// Without this, you’d just append content to whatever’s already inside the iframe.
// 4. doc.write( ... )
// This inserts new HTML code into the iframe’s document — effectively loading a new page inside the iframe.
// Example:
// doc.write("<h1>Hello inside iframe</h1>");
// Now your iframe will display that heading like a mini webpage.
// In your code, you’re writing a whole HTML template that includes TailwindCSS, Flowbite, etc.
// 5. doc.close()
// This tells the browser:
// “I’m done writing — you can now render what I wrote.”
// If you forget doc.close(), the iframe might stay in a loading state or not render properly.
import React, { useContext, useEffect, useRef, useState } from 'react';
import WebPageTools from './WebPageTools';
import ElementSettingSection from './ElementSettingSection';
import ImageSettingsSection from './ImageSettingOptions';
import { OnSaveContext } from '@/context/OnSaveContext';
import axios from 'axios';
import { toast } from 'sonner';
import { useParams, useSearchParams } from 'next/navigation';


type Props = {
  generatedCode: string; 
};


// This is a base HTML structure we inject inside the iframe.
// The placeholder {code} is replaced dynamically with the generated content.
const HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
  <title>AI Website Builder</title>

  <!-- TailwindCSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Flowbite CSS + JS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- Animation libraries -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.2/lottie.min.js"></script>

  <!-- SwiperJS (for carousels/sliders) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

  <!-- Tippy.js (tooltips) -->
  <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
  <script src="https://unpkg.com/@popperjs/core@2"></script>
  <script src="https://unpkg.com/tippy.js@6"></script>
</head>
<body>
  <!-- All generated content will be injected inside this root -->
  <div id="root">{code}</div>
</body>
</html>`;


function WebsiteDesign({ generatedCode }: Props) {

  const {projectId}=useParams();
  const params=useSearchParams();
  const frameId=params.get("frameId");

  const {onSaveData,setOnSaveData}=useContext(OnSaveContext);
  generatedCode = generatedCode?.replace('```', '');

  // useRef gives us direct access to the actual <iframe> element in the DOM
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Used to control preview mode (web / mobile / tablet, etc.)
  const [selectedScreenSize, setSelectedScreenSize] = useState('web');

  const [selectedEl,setSelectedEl]=useState<HTMLElement|null>()

  // ---------- EFFECT 1: Initialize the iframe structure once ----------
  useEffect(() => {
    if (!iframeRef.current) return; // If iframe not mounted yet, stop
    const doc = iframeRef.current.contentDocument; // Access the iframe's internal document
    if (!doc) return;

    // Clear any previous content and inject our HTML shell
    doc.open();
    doc.write(HTML_CODE);
    doc.close();

    // Wait until iframe <body> is fully parsed and available
    const waitForBody = () => {
      if (!doc.body) {
        // Retry on next animation frame if body is not yet ready
        requestAnimationFrame(waitForBody);
        return;
      }

     
      let hoverEL: HTMLElement | null = null;     // Currently hovered element
      let selectedEL: HTMLElement | null = null;  // Currently selected element for editing

      // ---------- EVENT HANDLERS ----------

      // Highlight element on hover (only if no element is currently selected)
      const handleMouseOver = (e: MouseEvent) => {
        if (selectedEL) return; // Skip hover if something is selected
        const target = e.target as HTMLElement;
        if (!target || target.id === 'root') return; // Ignore clicks on root

        // Remove previous hover outline
        if (hoverEL && hoverEL !== target) hoverEL.style.outline = "";
        hoverEL = target;
        hoverEL.style.outline = "2px dotted blue"; // Blue dotted outline on hover
      };

      // Remove hover outline when mouse leaves
      const handleMouseOut = () => {
        if (selectedEL) return; // Skip if editing
        if (hoverEL) {
          hoverEL.style.outline = "";
          hoverEL = null;
        }
      };

      // Handle click → Select element for editing
      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;
        if (!target || target.id === 'root') return;

        // Deselect previously selected element (if any)
        if (selectedEL && selectedEL !== target) {
          selectedEL.removeAttribute("contenteditable");
          selectedEL.style.outline = "";
        }

        // Select the new element
        selectedEL = target;
        selectedEL.style.outline = "2px solid red"; // Red border for selection
        selectedEL.setAttribute("contenteditable", "true"); // Make editable
        selectedEL.focus(); // Focus cursor inside for editing
        setSelectedEl(selectedEL)
      };

      // Handle keyboard (ESC key → deselect)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && selectedEL) {
          selectedEL.style.outline = "";
          selectedEL.removeAttribute("contenteditable");
          selectedEL = null;
        }
      };

      // ---------- ATTACH EVENT LISTENERS ----------
      doc.body.addEventListener("mouseover", handleMouseOver);
      doc.body.addEventListener("mouseout", handleMouseOut);
      doc.body.addEventListener("click", handleClick);
      doc.addEventListener("keydown", handleKeyDown); // keydown must be attached to document

      // ---------- CLEANUP ----------
      // When component unmounts or iframe reloads, remove all listeners
      return () => {
        doc.body.removeEventListener("mouseover", handleMouseOver);
        doc.body.removeEventListener("mouseout", handleMouseOut);
        doc.body.removeEventListener("click", handleClick);
        doc.removeEventListener("keydown", handleKeyDown);
      };
    };

    // Start waiting for the iframe <body> to exist
    waitForBody();
  }, []); // Run only once when component mounts


  // ---------- EFFECT 2: Update iframe content whenever generatedCode changes ----------
  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      const root = doc.getElementById('root');
      if (root) {
        // Replace <html> tags if they exist to prevent nested documents
        root.innerHTML = generatedCode
          ?.replace('<html>', "")
          ?.replace('</html>', "") ?? "";
      }
    }
  }, [generatedCode]);

  useEffect(()=>{
    onSaveData&&onSaveCode();
    
  },[onSaveData])

  const onSaveCode=async()=>{
    if(iframeRef.current){
      try {
        const iframeDoc=iframeRef.current.contentDocument||iframeRef.current.contentWindow?.document;
        if(iframeDoc){
          const cloneDoc=iframeDoc.documentElement.cloneNode(true)as HTMLElement;
          // remove all outlines
          const AllEls=cloneDoc.querySelectorAll<HTMLElement>("*");
          AllEls.forEach((el)=>{
            el.style.outline="";
            el.style.cursor="";
          })
          const html=cloneDoc.outerHTML;
          console.log("HTML to save",html);
          const result=await axios.put('/api/frames',{
            designCode:html,
            frameId:frameId,
            projectId:projectId
          })
          console.log(result.data);
          toast.success("Saved!")
          
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  // ---------- RENDER ----------
  return (
    <div className="flex gap-2 w-full ">
      <div className="p-5 w-full flex items-center flex-col">
        {/* iframe acts as a sandboxed browser window where generated HTML runs independently */}
        <iframe
          ref={iframeRef}
          className={`${selectedScreenSize === 'web' ? 'w-full' : 'w-130'} h-[600px] border-2 rounded-xl`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
        />

        {/* External component for tools (like resizing, exporting, etc.) */}
        <WebPageTools
          selectedScreenSize={selectedScreenSize}
          setSelectedScreenSize={(v: string) => setSelectedScreenSize(v)}
          code={generatedCode}
        />
      </div>
      {/* setting section */}

        {selectedEl?.tagName=='IMG'?
        // @ts-ignore
        <ImageSettingsSection selectedEL={selectedEl}/>
        // @ts-ignore
        : <ElementSettingSection selectedEL={selectedEl} clearSelection={()=>setSelectedEl(null)}/>}
    </div>
  );
}

export default WebsiteDesign;
