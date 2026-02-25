import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, ChevronDown, RotateCcw, AlertTriangle, Download } from "lucide-react";
import { NICE_CLASSES } from "@/lib/nice-classes";
import { checkSimilarity, submitApplication, uploadLogo } from "@/lib/api";
import type { SimilarMark } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { generateMarkDisplayData } from "@/lib/random-mark-data";

const schema = z.object({
  businessName: z.string().trim().min(1, "Required").max(200),
  applicantName: z.string().trim().min(1, "Required").max(200),
  contactNumber: z.string().trim().min(6, "Enter a valid phone number").max(20),
  email: z.string().trim().email("Enter a valid email").max(255),
  category: z.string().min(1, "Select a category"),
  logoText: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SimilarityCheck() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SimilarMark[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportImageReport, setExportImageReport] = useState(true);
  const [exportTextReport, setExportTextReport] = useState(true);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "">("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { businessName: "", applicantName: "", contactNumber: "", email: "", category: "", logoText: "" },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      toast({ title: "Invalid file type", description: "Only PNG and JPG files are accepted.", variant: "destructive" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (values: FormValues) => {
    if (!file) {
      toast({ title: "Logo required", description: "Please upload a logo image.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => v && fd.append(k, v));
      fd.append("logo_image", file);
      const res = await checkSimilarity(fd);
      setResults(res);
    } catch {
      toast({ title: "Error", description: "Failed to analyze logo. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasHighSimilarity = results?.some((m) => m.similarity >= 90);

  const handleSubmitClick = () => {
    if (hasHighSimilarity) {
      setShowWarning(true);
    } else {
      handleSubmitApplication();
    }
  };

  const handleSubmitApplication = async () => {
    if (submitted) return;
    setSubmitting(true);
    try {
      const values = form.getValues();
      let logoUrl = "";
      if (file) {
        logoUrl = await uploadLogo(file);
      }
      const res = await submitApplication({
        businessName: values.businessName,
        applicantName: values.applicantName,
        contactNumber: values.contactNumber,
        email: values.email,
        category: values.category,
        logoText: values.logoText || "",
        logoUrl,
      });
      setSubmitted(true);
      setShowWarning(false);
      toast({ title: "Application Submitted", description: `Application ID: ${res.applicationId}` });
      const email = form.getValues("email");
      navigate(`/track?id=${encodeURIComponent(res.applicationId)}&email=${encodeURIComponent(email)}`);
    } catch {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setFile(null);
    setPreview(null);
    setResults(null);
    setSubmitted(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleExportSubmit = () => {
    if (!exportEmail) {
      toast({ title: "Email required", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    if (!exportFormat) {
      toast({ title: "Format required", description: "Please select an export format.", variant: "destructive" });
      return;
    }
    toast({ title: "Export Requested", description: "You will receive the report via email shortly." });
    setShowExport(false);
    setExportEmail("");
    setExportFormat("");
  };

  const [sectionsOpen, setSectionsOpen] = useState({ applicant: true, trademark: true });

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="mb-1 text-xl font-semibold">Submit Application</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Complete the form below and upload your logo to check against registered trademarks and submit your application.
        </p>

        {!results ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Collapsible open={sectionsOpen.applicant} onOpenChange={(o) => setSectionsOpen((s) => ({ ...s, applicant: o }))}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Applicant Information</CardTitle>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <FormField control={form.control} name="businessName" render={({ field }) => (
                        <FormItem><FormLabel>Business Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="applicantName" render={({ field }) => (
                        <FormItem><FormLabel>Applicant Full Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="contactNumber" render={({ field }) => (
                        <FormItem><FormLabel>Contact Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Collapsible open={sectionsOpen.trademark} onOpenChange={(o) => setSectionsOpen((s) => ({ ...s, trademark: o }))}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Trademark Details</CardTitle>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trademark Category (NICE Class) *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                            <SelectContent>{NICE_CLASSES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div>
                        <Label>Logo Upload (PNG/JPG, max 5MB) *</Label>
                        <div
                          className="mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const f = e.dataTransfer.files?.[0];
                            if (f) {
                              if (!["image/png", "image/jpeg"].includes(f.type)) {
                                toast({ title: "Invalid file type", description: "Only PNG and JPG files are accepted.", variant: "destructive" });
                                return;
                              }
                              if (f.size > 5 * 1024 * 1024) {
                                toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
                                return;
                              }
                              setFile(f);
                              setPreview(URL.createObjectURL(f));
                            }
                          }}
                          onClick={() => fileRef.current?.click()}
                        >
                          {preview ? (
                            <img src={preview} alt="Logo preview" className="h-32 w-32 rounded border object-contain" />
                          ) : (
                            <>
                              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                              <p className="text-sm font-medium text-foreground">Drop file here or click to browse</p>
                              <p className="text-xs text-muted-foreground">PNG or JPG, max 5MB</p>
                            </>
                          )}
                          {file && <p className="mt-2 text-xs text-muted-foreground">{file.name}</p>}
                        </div>
                        <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
                      </div>

                      <FormField control={form.control} name="logoText" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Text Present in Logo (optional)</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. MyBrand" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  {loading ? "Analyzing Logo Using AI Model..." : "Submit a New Application"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-1 h-4 w-4" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Matching Registered Trademarks</h2>
              <Button variant="default" size="sm" onClick={() => setShowExport(true)}>
                <Download className="mr-1 h-4 w-4" /> Export Search Report
              </Button>
            </div>

            <div className="mb-6 overflow-auto rounded-lg border">
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
                    return (
                      <TableRow key={m.id}>
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

            <div className="mb-4 flex gap-3">
              <Button onClick={handleSubmitClick} disabled={submitting || submitted}>
                {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {submitted ? "Application Submitted" : "Submit Application"}
              </Button>
              <Button variant="outline" onClick={handleReset}>Upload Different Logo</Button>
            </div>

            <p className="rounded border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This AI similarity analysis is advisory. Final approval is subject to
              formal evaluation by the Trademark Authority.
            </p>
          </div>
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
                <p className="mb-2 text-sm font-medium">Please select one/both of the following options:</p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={exportImageReport} onCheckedChange={(v) => setExportImageReport(!!v)} />
                    Image Search Report
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={exportTextReport} onCheckedChange={(v) => setExportTextReport(!!v)} />
                    Text Search Report
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

        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertDialogTitle>High Similarity Detected</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="space-y-3 text-sm">
                <p>Your uploaded logo appears to closely resemble one or more existing registered trademarks.</p>
                <p>Submitting this application may increase the likelihood of objection or rejection during official examination.</p>
                <p className="font-medium text-foreground">Please review the similar marks displayed before proceeding.</p>
                <p>Do you wish to continue with submission?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel>Review Similar Marks</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmitApplication} disabled={submitting}>
                {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Proceed with Submission
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
