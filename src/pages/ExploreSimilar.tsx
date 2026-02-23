import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Loader2, Upload } from "lucide-react";
import { NICE_CLASSES } from "@/lib/nice-classes";
import { exploreSimilarity } from "@/lib/api";
import type { SimilarMark } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function ExploreSimilar() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimilarMark[] | null>(null);
  const [minSimilarity, setMinSimilarity] = useState(0);
  const [sortDesc, setSortDesc] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      toast({ title: "Invalid file", description: "Only PNG/JPG accepted.", variant: "destructive" });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      if (file) fd.append("logo_image", file);
      if (keyword) fd.append("keyword", keyword);
      if (category) fd.append("category", category);
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
        <p className="mb-6 text-sm text-muted-foreground">Search registered trademarks by logo, keyword, or category.</p>

        <Tabs defaultValue="logo" className="mb-6">
          <TabsList>
            <TabsTrigger value="logo">Logo Upload</TabsTrigger>
            <TabsTrigger value="keyword">Keyword Search</TabsTrigger>
          </TabsList>
          <TabsContent value="logo" className="mt-4 space-y-3">
            <div>
              <Label>Upload Logo (PNG/JPG)</Label>
              <div className="mt-1 flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-1 h-4 w-4" /> Choose File
                </Button>
                <span className="text-sm text-muted-foreground">{file?.name || "No file selected"}</span>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
              </div>
              {preview && <img src={preview} alt="Preview" className="mt-2 h-24 w-24 rounded border object-contain" />}
            </div>
          </TabsContent>
          <TabsContent value="keyword" className="mt-4">
            <Label>Keyword</Label>
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter trademark name or keyword" className="mt-1 max-w-md" />
          </TabsContent>
        </Tabs>

        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div className="w-64">
            <Label>Category (optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="All classes" /></SelectTrigger>
              <SelectContent>{NICE_CLASSES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Search
          </Button>
        </div>

        {results && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Label className="text-xs">Min Similarity: {minSimilarity}%</Label>
                <Slider value={[minSimilarity]} onValueChange={([v]) => setMinSimilarity(v)} max={100} step={1} className="w-40" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSortDesc(!sortDesc)}>
                Sort: {sortDesc ? "High → Low" : "Low → High"}
              </Button>
              <span className="text-xs text-muted-foreground">{filtered?.length} results</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered?.map((m) => (
                <Card key={m.id} className="text-center">
                  <CardContent className="p-4">
                    <img src={m.imageUrl} alt={m.trademarkId} className="mx-auto mb-2 h-20 w-20 rounded border object-contain" />
                    <p className="text-lg font-bold text-accent">{m.similarity}%</p>
                    <p className="text-xs text-muted-foreground">{m.trademarkId}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
