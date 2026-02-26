import { useState, useRef } from "react";
import { sendEmail } from "@/lib/send-email";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, Download } from "lucide-react";
import { NICE_CLASSES } from "@/lib/nice-classes";
import { exploreSimilarity } from "@/lib/api";
import type { SimilarMark } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { generateMarkDisplayData } from "@/lib/random-mark-data";

export default function ExploreSimilar() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoText, setLogoText] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SimilarMark[] | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportImageReport, setExportImageReport] = useState(true);
  
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "">("");
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

  const handleExportSubmit = async () => {
    if (!exportEmail) {
      toast({ title: "Email required", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    if (!exportFormat) {
      toast({ title: "Format required", description: "Please select an export format.", variant: "destructive" });
      return;
    }
    try {
      const formatLabel = exportFormat === "pdf" ? "PDF" : "Excel";
      await sendEmail({
        receiver_email: exportEmail,
        subject: `Your Image Search Report (${formatLabel}) is being prepared`,
        body: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background-color:#1a2b5f;padding:32px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">TrademarkING</h1></td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#1a2b5f;font-size:20px;">Export Report Request Received</h2>
          <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">Your export request has been received and is being processed.</p>
          <table role="presentation" width="100%" style="background:#f8f9fc;border-radius:6px;border:1px solid #e2e6ef;margin-bottom:24px;">
            <tr><td style="padding:20px;">
              <table role="presentation" width="100%">
                <tr><td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Report Type</td><td style="padding:6px 0;color:#333;font-size:14px;font-weight:600;">Image Search Report</td></tr>
                <tr><td style="padding:6px 0;color:#888;font-size:13px;">Export Format</td><td style="padding:6px 0;color:#333;font-size:14px;">${formatLabel}</td></tr>
              </table>
            </td></tr>
          </table>
          <p style="margin:0;color:#555;font-size:14px;">If you did not request this export, please disregard this email.</p>
        </td></tr>
        <tr><td style="background-color:#f8f9fc;padding:24px 40px;border-top:1px solid #e2e6ef;text-align:center;">
          <p style="margin:0 0 4px;color:#999;font-size:12px;">This is an automated message from TrademarkING.</p>
          <p style="margin:0;color:#999;font-size:12px;">Please do not reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
      toast({ title: "Export Requested", description: "You will receive the report via email shortly." });
    } catch {
      toast({ title: "Error", description: "Failed to send export email.", variant: "destructive" });
    }
    setShowExport(false);
    setExportEmail("");
    setExportFormat("");
  };

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
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{results.length} results</span>
              <Button variant="default" size="sm" onClick={() => setShowExport(true)}>
                <Download className="mr-1 h-4 w-4" /> Export Search Report
              </Button>
            </div>
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">S/N</TableHead>
                    <TableHead className="w-28">Thumbnail</TableHead>
                    <TableHead>Application No.</TableHead>
                    <TableHead>Class No.</TableHead>
                    <TableHead>Applicant(s)</TableHead>
                    <TableHead>Filing Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((m, i) => {
                    const data = generateMarkDisplayData(m.trademarkId, i);
                    const isHigh = m.similarity >= 90;
                    return (
                      <TableRow key={m.id} className={isHigh ? "bg-destructive/10" : ""}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>
                          <img
                            src={m.imageUrl}
                            alt={m.trademarkId}
                            className="h-20 w-20 rounded border object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setLightboxUrl(m.imageUrl)}
                          />
                        </TableCell>
                        <TableCell className="text-primary font-medium">{m.trademarkId}</TableCell>
                        <TableCell>{data.classNo}</TableCell>
                        <TableCell>{data.applicant}</TableCell>
                        <TableCell>{data.filingDate}</TableCell>
                        <TableCell>{data.status}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {results.some((m) => m.similarity >= 90) && (
              <div className="my-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 flex items-center gap-3">
                <span className="inline-block h-5 w-5 shrink-0 rounded bg-destructive/30 border border-destructive/40" />
                <span className="text-sm font-medium text-destructive">Red rows indicate your logo is highly similar to an existing registered trademark. Please review carefully before proceeding.</span>
              </div>
            )}
          </>
        )}

        <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
          <DialogContent className="flex items-center justify-center p-2 sm:max-w-md">
            {lightboxUrl && <img src={lightboxUrl} alt="Trademark" className="max-h-[70vh] w-full rounded object-contain" />}
          </DialogContent>
        </Dialog>

        {/* Export Search Report Dialog */}
        <Dialog open={showExport} onOpenChange={setShowExport}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Export Search Report</DialogTitle>
              <DialogDescription>
                You will be notified via the email address provided once the results are ready and you may retrieve them via the email notification.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Label className="w-16 shrink-0">Email</Label>
                <Input value={exportEmail} onChange={(e) => setExportEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Please select the following option:</p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={exportImageReport} onCheckedChange={(v) => setExportImageReport(!!v)} />
                    Image Search Report
                  </label>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Please select the file to export in:</p>
                <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as "excel" | "pdf")}>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value="excel" /> Excel
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value="pdf" /> PDF
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExport(false)}>Cancel</Button>
              <Button onClick={handleExportSubmit}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
