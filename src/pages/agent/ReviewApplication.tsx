import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GovBanner } from "@/components/layout/GovBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, ArrowLeft } from "lucide-react";
import { getApplicationById, submitDecision } from "@/lib/api";
import type { Application, SimilarMark } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function ReviewApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [app, setApp] = useState<(Application & { similarMarks: SimilarMark[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [notes, setNotes] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getApplicationById(id).then(setApp).catch(() => {
      toast({ title: "Error", description: "Application not found.", variant: "destructive" });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDecision = async (decision: "approved" | "rejected") => {
    if (decision === "rejected" && !notes.trim()) {
      toast({ title: "Notes Required", description: "Please provide notes for rejection.", variant: "destructive" });
      return;
    }
    setDeciding(true);
    try {
      await submitDecision(id!, decision, notes);
      toast({ title: "Decision Submitted", description: `Application ${decision}.` });
      navigate("/agent/dashboard");
    } catch {
      toast({ title: "Error", description: "Failed to submit decision.", variant: "destructive" });
    } finally {
      setDeciding(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!app) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Application not found.</div>;

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-success text-success-foreground";
    if (s === "rejected") return "bg-destructive text-destructive-foreground";
    return "bg-warning text-warning-foreground";
  };

  return (
    <div className="min-h-screen">
      <GovBanner />
      <div className="bg-primary px-6 py-3 text-primary-foreground">
        <Button variant="ghost" size="sm" className="mr-3 text-primary-foreground hover:text-primary-foreground/80" onClick={() => navigate("/agent/dashboard")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <span className="font-semibold">Review Application: {app.id}</span>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Left: Applicant details */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Applicant Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <img src={app.logoUrl} alt="Logo" className="h-48 w-48 rounded border object-contain" />
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Business:</span> {app.businessName}</p>
              <p><span className="font-medium">Applicant:</span> {app.applicantName}</p>
              <p><span className="font-medium">Contact:</span> {app.contactNumber}</p>
              <p><span className="font-medium">Email:</span> {app.email}</p>
              <p><span className="font-medium">Category:</span> Class {app.category}</p>
              <p><span className="font-medium">Logo Text:</span> {app.logoText || "N/A"}</p>
              <p><span className="font-medium">Submitted:</span> {app.submissionDate}</p>
              <p className="flex items-center gap-2"><span className="font-medium">Status:</span> <Badge className={statusColor(app.status)}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</Badge></p>
            </div>

            {app.status === "submitted" && (
              <div className="space-y-3 border-t pt-4">
                <div>
                  <Label>Decision Notes {`(mandatory for rejection)`}</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter notes..." className="mt-1" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => handleDecision("approved")} disabled={deciding} className="bg-success hover:bg-success/90 text-success-foreground">
                    {deciding && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Approve
                  </Button>
                  <Button onClick={() => handleDecision("rejected")} disabled={deciding} variant="destructive">
                    {deciding && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Reject
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: AI Similarity Analysis */}
        <Card>
          <CardHeader><CardTitle className="text-sm">AI Similarity Analysis</CardTitle></CardHeader>
          <CardContent>
            {app.similarMarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No similarity results available.</p>
            ) : (
              <div className="overflow-x-auto rounded border border-border">
                {app.similarMarks[0]?.queryOcr?.length > 0 && (
                  <div className="border-b bg-muted/30 px-3 py-2 text-sm">
                    <span className="font-medium">Detected OCR Text:</span>{" "}
                    <span className="text-accent font-semibold">{app.similarMarks[0].queryOcr.join(", ")}</span>
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Image</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Final</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">DINO</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">VGG</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Text</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Color</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Font</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Shape</th>
                    </tr>
                  </thead>
                  <tbody>
                    {app.similarMarks.map((m) => (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <img src={m.imageUrl} alt={m.trademarkId} className="h-14 w-14 rounded border object-contain cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLightboxUrl(m.imageUrl)} />
                        </td>
                        <td className="px-3 py-2 font-medium">{m.trademarkId}</td>
                        <td className="px-3 py-2 text-right font-bold text-accent">{m.similarity}%</td>
                        <td className="px-3 py-2 text-right">{(m.dinoScore * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{(m.vggScore * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{(m.textScore * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{(m.colorScore * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{(m.fontScore * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{(m.shapeScore * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="flex items-center justify-center p-2 sm:max-w-md">
          {lightboxUrl && <img src={lightboxUrl} alt="Trademark" className="max-h-[70vh] w-full rounded object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
