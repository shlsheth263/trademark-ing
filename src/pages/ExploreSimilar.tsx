import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Upload, X } from "lucide-react";
import { NICE_CLASSES } from "@/lib/nice-classes";
import { exploreSimilarity } from "@/lib/api";
import type { SimilarMark } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function ExploreSimilar() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoText, setLogoText] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimilarMark[] | null>(null);
  const [minSimilarity, setMinSimilarity] = useState(0);
  const [sortDesc, setSortDesc] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      toast({ title: "Invalid file", description: "Only PNG/JPG accepted.", variant: "destructive" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSearch = async () => {
    if (!file) {
      toast({ title: "Logo required", description: "Please upload a logo image.", variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: "Category required", description: "Please select a NICE class.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("logo_image", file);
      fd.append("category", category);
      if (logoText) fd.append("logoText", logoText);
      const res = await exploreSimilarity(fd);
      setResults(res);
    } catch {
      toast({ title: "Error", description: "Search failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = results
    ?.filter((m) => m.similarity >= minSimilarity)
    .sort((a, b) => (sortDesc ? b.similarity - a.similarity : a.similarity - b.similarity));

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="mb-1 text-xl font-semibold">Explore Similar Marks</h1>
        <p className="mb-6 text-sm text-muted-foreground">Upload your logo and select a category to search registered trademarks.</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Trademark Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Trademark Category (NICE Class) *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a class" /></SelectTrigger>
                <SelectContent>{NICE_CLASSES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <Label>Logo Upload (PNG/JPG, max 5MB) *</Label>
              <div className="mt-1 flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-1 h-4 w-4" /> Choose File
                </Button>
                <span className="text-sm text-muted-foreground">{file?.name || "No file selected"}</span>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
              </div>
              {preview && <img src={preview} alt="Preview" className="mt-2 h-24 w-24 rounded border object-contain" />}
            </div>

            <div>
              <Label>Text Present in Logo (optional)</Label>
              <Input value={logoText} onChange={(e) => setLogoText(e.target.value)} placeholder="e.g. MyBrand" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSearch} disabled={loading} className="mb-6">
          {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Search
        </Button>

        {results && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-6">
              <span className="text-xs text-muted-foreground">{filtered?.length} results</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered?.map((m) => (
                <div key={m.id} className="group rounded-lg border border-border bg-card p-2 transition-shadow hover:shadow-md">
                  <img
                    src={m.imageUrl}
                    alt={m.trademarkId}
                    className="aspect-square w-full rounded border object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setLightboxUrl(m.imageUrl)}
                  />
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium truncate">{m.trademarkId}</p>
                    <p className="text-xs font-bold text-accent">{m.similarity}% match</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
          <DialogContent className="flex items-center justify-center p-2 sm:max-w-md">
            {lightboxUrl && <img src={lightboxUrl} alt="Trademark" className="max-h-[70vh] w-full rounded object-contain" />}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
