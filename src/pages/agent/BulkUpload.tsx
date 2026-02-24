import { useState, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, XCircle, Loader2, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  name: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function BulkUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = useCallback((selected: FileList | null) => {
    if (!selected) return;
    const valid = Array.from(selected).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    setFiles(valid);
    setResults(valid.map((f) => ({ name: f.name, status: "pending" })));
    setCompleted(0);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let done = 0;

    const updated = [...results];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      updated[i] = { ...updated[i], status: "uploading" };
      setResults([...updated]);

      try {
        const { error } = await supabase.storage
          .from("trademark-images")
          .upload(file.name, file, { contentType: file.type, upsert: true });

        if (error) throw error;
        updated[i] = { ...updated[i], status: "success" };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        updated[i] = { ...updated[i], status: "error", error: msg };
      }

      done++;
      setCompleted(done);
      setResults([...updated]);
    }

    setUploading(false);
    const successCount = updated.filter((r) => r.status === "success").length;
    const errorCount = updated.filter((r) => r.status === "error").length;
    toast({
      title: "Upload Complete",
      description: `${successCount} succeeded, ${errorCount} failed out of ${files.length} files.`,
    });
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const progress = files.length > 0 ? (completed / files.length) * 100 : 0;

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <h1 className="mb-1 text-xl font-semibold">Bulk Upload Trademark Images</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Upload trademark reference images to the storage bucket. These will be used for similarity matching results.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Select Images</CardTitle>
            <CardDescription>Drag & drop or select multiple PNG/JPG/WEBP files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
            >
              <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports PNG, JPG, WEBP</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span>{files.length} files selected</span>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {successCount > 0 && (
                      <span className="text-green-600">{successCount} ✓</span>
                    )}
                    {errorCount > 0 && (
                      <span className="text-destructive">{errorCount} ✗</span>
                    )}
                  </div>
                </div>

                {uploading && <Progress value={progress} className="h-2" />}

                <Button onClick={handleUpload} disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading {completed}/{files.length}...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {files.length} Images
                    </>
                  )}
                </Button>

                {/* File list */}
                <div className="max-h-64 space-y-1 overflow-y-auto rounded border p-2">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 text-xs">
                      <span className="truncate">{r.name}</span>
                      {r.status === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />}
                      {r.status === "error" && (
                        <span className="flex items-center gap-1 text-destructive">
                          <XCircle className="h-4 w-4 shrink-0" />
                          {r.error}
                        </span>
                      )}
                      {r.status === "uploading" && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
