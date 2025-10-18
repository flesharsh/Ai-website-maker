import React from 'react'
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger } from '@/components/ui/dialog'
import SyntaxHighlighter from "react-syntax-highlighter";
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ViewCodeBlock = ({children,code}:any) => {

    const handleCopy=async()=>{
        await navigator.clipboard.writeText(code);
        toast.success("code copied")
    }

  return (
    <Dialog>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent className='min-w-5xl max-h-[600px] overflow-auto'>
            <DialogHeader>
                <DialogTitle><div className="flex justify-between gap-4 items-center"></div> Source code <Button onClick={()=>handleCopy()}><Copy/></Button></DialogTitle>
                <DialogDescription asChild>
                    <div className="">
                        <SyntaxHighlighter>
                            {code}
                        </SyntaxHighlighter>
                    </div>
                </DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}

export default ViewCodeBlock