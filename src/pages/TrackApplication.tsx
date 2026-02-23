import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { getApplicationStatus } from "@/lib/api";
import type { Application } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  applicationId: z.string().trim().min(1, "Required"),
});

export default function TrackApplication() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Application | null | undefined>(undefined);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", applicationId: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      const res = await getApplicationStatus(values.email, values.applicationId);
      setResult(res);
      if (!res) toast({ title: "Not Found", description: "No application found with the provided details.", variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Failed to fetch status.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-success text-success-foreground";
    if (s === "rejected") return "bg-destructive text-destructive-foreground";
    return "bg-warning text-warning-foreground";
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="mb-1 text-xl font-semibold">Track My Trademark Application</h1>
        <p className="mb-6 text-sm text-muted-foreground">Enter your details to check your application status.</p>

        <Card className="mb-6 max-w-lg">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="applicationId" render={({ field }) => (
                  <FormItem><FormLabel>Application ID</FormLabel><FormControl><Input {...field} placeholder="e.g. APP-2024-001" /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Track Application
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Application: {result.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <img src={result.logoUrl} alt="Logo" className="h-28 w-28 rounded border object-contain" />
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Business:</span> {result.businessName}</p>
                  <p><span className="font-medium">Applicant:</span> {result.applicantName}</p>
                  <p><span className="font-medium">Submitted:</span> {result.submissionDate}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge className={statusColor(result.status)}>{result.status.charAt(0).toUpperCase() + result.status.slice(1)}</Badge>
                  </p>
                  {result.agentNotes && (
                    <p><span className="font-medium">Agent Notes:</span> {result.agentNotes}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result === null && (
          <p className="text-sm text-muted-foreground">No application found. Please check your Application ID and email address.</p>
        )}
      </div>
    </Layout>
  );
}
