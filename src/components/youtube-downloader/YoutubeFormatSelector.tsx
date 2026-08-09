import type { YoutubeFormat } from "@/services/youtubeDownloader";
import { formatBytes } from "@/services/youtubeDownloader";

interface Props {
  formats: YoutubeFormat[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function YoutubeFormatSelector({ formats, selected, onSelect }: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-bold text-foreground">
        Escolha o formato e a qualidade
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {formats.map((f) => (
          <label
            key={f.id}
            className={`flex cursor-pointer items-start gap-3 rounded-md border-2 p-3 transition-colors ${
              selected === f.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type="radio"
              name="yt-format"
              value={f.id}
              checked={selected === f.id}
              onChange={() => onSelect(f.id)}
              className="mt-1"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{f.label}</span>
              <span className="block text-xs text-muted-foreground">
                {f.container.toUpperCase()} · tamanho estimado: {formatBytes(f.estimatedBytes)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
