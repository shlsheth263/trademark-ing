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
import { Loader2, Upload, ChevronDown, RotateCcw } from "lucide-react";
import { NICE_CLASSES } from "@/lib/nice-classes";
import { checkSimilarity, submitApplication, uploadLogo } from "@/lib/api";
import type { SimilarMark } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

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
      toast({ title: "Application Submitted", description: `Application ID: ${res.applicationId}` });
      const email = form.getValues("email");
      navigate(`/track-application?id=${encodeURIComponent(res.applicationId)}&email=${encodeURIComponent(email)}`);
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

  const [sectionsOpen, setSectionsOpen] = useState({ applicant: true, trademark: true });

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="mb-1 text-xl font-semibold">Check Trademark Similarity</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Complete the form below and upload your logo to check against registered trademarks.
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
                        <div className="mt-1 flex items-center gap-4">
                          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                            <Upload className="mr-1 h-4 w-4" /> Choose File
                          </Button>
                          <span className="text-sm text-muted-foreground">{file?.name || "No file selected"}</span>
                          <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
                        </div>
                        {preview && <img src={preview} alt="Logo preview" className="mt-3 h-32 w-32 rounded border object-contain" />}
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
            <h2 className="mb-4 text-lg font-semibold">Top Matching Registered Trademarks</h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {results.map((m) => (
                <Card key={m.id} className="text-center">
                  <CardContent className="p-4">
                    <img src={m.imageUrl} alt={m.trademarkId} className="mx-auto mb-3 h-24 w-24 rounded border object-contain" />
                    <p className="text-xl font-bold text-accent">{m.similarity}%</p>
                    <p className="text-xs text-muted-foreground">{m.trademarkId}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mb-4 flex gap-3">
              <Button onClick={handleSubmitApplication} disabled={submitting || submitted}>
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
      </div>
    </Layout>
  );
}
