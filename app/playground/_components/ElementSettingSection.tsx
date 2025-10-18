import { SwatchBook, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'

type Props = {
  selectedEL: HTMLElement,       // The actual selected DOM element from iframe
  clearSelection: () => void;    // Function to deselect (not used yet here)
}

function ElementSettingSection({ selectedEL, clearSelection }: Props) {
  // Store class names of the element
  const [classes, setClasses] = useState<string[]>([]);
  // Temporary input for adding new class
  const [newClass, setNewClass] = useState("");
  // Text alignment (left, center, right)
  const [align, setAlign] = React.useState(selectedEL?.style?.textAlign);

  // Apply inline style dynamically
  const applyStyle = (property: string, value: string) => {
    if (selectedEL) selectedEL.style[property as any] = value;
  };

  // Update alignment when toggled
  useEffect(() => {
    if (selectedEL && align) selectedEL.style.textAlign = align;
  }, [align, selectedEL]);

  // Sync element class changes
  useEffect(() => {
    if (!selectedEL) return;

    // Initial class list
    const currentClasses = selectedEL.className.split(" ").filter(c => c.trim() !== "");
    setClasses(currentClasses);

    // Watch for class mutations
    const observer = new MutationObserver(() => {
      const updated = selectedEL.className.split(" ").filter(c => c.trim() !== "");
      setClasses(updated);
    });

    observer.observe(selectedEL, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [selectedEL]);

  // Remove a class
  const removeClass = (cls: string) => {
    const updated = classes.filter(c => c !== cls);
    setClasses(updated);
    selectedEL.className = updated.join(" ");
  };

  // Add a new class
  const addClass = () => {
    const trimmed = newClass.trim();
    if (!trimmed) return;
    if (!classes.includes(trimmed)) {
      const updated = [...classes, trimmed];
      setClasses(updated);
      selectedEL.className = updated.join(" ");
    }
    setNewClass("");
  };

  return (
    <div className='w-96 shadow p-4 space-y-4 overflow-auto h-[90vh] rounded-xl mt-2 mr-2'>
      <h2 className='flex gap-2 items-center font-bold'>
        <SwatchBook /> Settings
      </h2>

      {/* === FONT SIZE + COLOR === */}
      <div className="flex-1">
        {/* Font Size dropdown */}
        <div className="flex items-center gap-4">
          <label className='text-sm'>Font Size</label>
          <Select
            defaultValue={selectedEL?.style?.fontSize || '24px'}
            onValueChange={(value) => applyStyle('fontSize', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Size" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(53)].map((_, index) => (
                <SelectItem value={`${index + 12}px`} key={index}>
                  {index + 12}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Color picker */}
        <div className='mt-4'>
          <label className='text-sm block'>Text Color</label>
          <input
            type='color'
            className='w-[40px] h-[40px] rounded-lg mt-1'
            value={selectedEL?.style?.color || '#000000'}
            onChange={(event) => applyStyle('color', event.target.value)}
          />
        </div>
      </div>

      {/* === TEXT ALIGNMENT === */}
      <div className="mt-4">
        <label className="text-sm mb-1 block">Text Alignment</label>
        <ToggleGroup
          type="single"
          value={align}
          onValueChange={setAlign}
          className="bg-gray-100 rounded-lg p-1 inline-flex w-full justify-between"
        >
          <ToggleGroupItem value="left" className="p-2 flex-1"><AlignLeft size={20} /></ToggleGroupItem>
          <ToggleGroupItem value="center" className="p-2 flex-1"><AlignCenter size={20} /></ToggleGroupItem>
          <ToggleGroupItem value="right" className="p-2 flex-1"><AlignRight size={20} /></ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* === BACKGROUND + BORDER RADIUS === */}
      <div className="flex items-center gap-4 mt-4">
        <div>
          <label className='text-sm block'>Background</label>
          <input
            type='color'
            className='w-[40px] h-[40px] rounded-lg mt-1'
            defaultValue={selectedEL?.style?.backgroundColor || '#ffffff'}
            onChange={(event) => applyStyle('backgroundColor', event.target.value)}
          />
        </div>
        <div className='flex-1'>
          <label className='text-sm'>Border Radius</label>
          <input
            type='text'
            placeholder='e.g. 8px'
            defaultValue={selectedEL?.style?.borderRadius || ''}
            onChange={(e) => applyStyle('borderRadius', e.target.value)}
            className='mt-1'
          />
        </div>
      </div>

      {/* === PADDING + MARGIN === */}
      <div className='mt-4'>
        <label className='text-sm'>Padding</label>
        <input
          type='text'
          placeholder='e.g. 10px 15px'
          defaultValue={selectedEL?.style?.padding || ''}
          onChange={(e) => applyStyle('padding', e.target.value)}
          className='mt-1'
        />
      </div>
      <div className='mt-4'>
        <label className='text-sm'>Margin</label>
        <input
          type='text'
          placeholder='e.g. 10px 15px'
          defaultValue={selectedEL?.style?.margin || ''}
          onChange={(e) => applyStyle('margin', e.target.value)}
          className='mt-1'
        />
      </div>

      {/* === CLASS MANAGER === */}
      <div className='mt-4'>
        <label className='text-sm font-medium'>Classes</label>
        <div className='flex flex-wrap gap-2 mt-2'>
          {classes.length > 0 ? (
            classes.map((cls) => (
              <span key={cls} className="flex text-xs items-center gap-1 px-2 py-1 rounded-full bg-gray-100 border">
                {cls}
                <button onClick={() => removeClass(cls)} className="ml-1 text-red-500 hover:text-red-700">x</button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No classes applied</span>
          )}
        </div>

        {/* Add new class */}
        <div className='flex gap-2 mt-3'>
          <Input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="Add class..." />
          <Button type="button" onClick={addClass}>Add</Button>
        </div>
      </div>
    </div>
  );
}

export default ElementSettingSection;
