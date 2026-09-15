import { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadButtonProps {
  onUpload: (dataUrl: string, fileName: string) => void;
  disabled?: boolean;
}

export const ImageUploadButton = ({ onUpload, disabled }: ImageUploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-40"
      >
        <Upload className="h-4 w-4" />
        Upload image
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const reader = new FileReader();
            reader.onload = () => onUpload(reader.result as string, file.name);
            reader.onerror = () => console.error('Failed to read image file:', reader.error);
            reader.readAsDataURL(file);
          } catch (err) {
            console.error('Failed to read image file:', err);
          }
          e.target.value = '';
        }}
      />
    </>
  );
};
