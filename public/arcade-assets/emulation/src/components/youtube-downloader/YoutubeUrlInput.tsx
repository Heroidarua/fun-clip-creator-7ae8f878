import { Loader2, Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled?: boolean;
}

export default function YoutubeUrlInput({ value, onChange, onSubmit, loading, disabled }: Props) {
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="sr-only" htmlFor="yt-url">
        URL do vídeo do YouTube
      </label>
      <input
        id="yt-url"
        type="url"
        inputMode="url"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cole aqui a URL do vídeo do YouTube"
        className="w-full flex-1 rounded-md border-2 border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
      />
      <button
        type="submit"
        disabled={loading || disabled}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {loading ? "Analisando vídeo..." : "Analisar vídeo"}
      </button>
    </form>
  );
}
