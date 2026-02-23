import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GovBanner } from "@/components/layout/GovBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutDashboard, Clock, CheckCircle, XCircle, LogOut } from "lucide-react";
import { getApplications } from "@/lib/api";
import type { Application } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "All Applications", value: "all", icon: LayoutDashboard },
  { label: "Pending", value: "pending", icon: Clock },
  { label: "Approved", value: "approved", icon: CheckCircle },
  { label: "Rejected", value: "rejected", icon: XCircle },
];

export default function AgentDashboard() {
  const [filter, setFilter] = useState("all");
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getApplications(filter).then(setApps).finally(() => setLoading(false));
  }, [filter]);

  const handleLogout = () => { logout(); navigate("/agent/login"); };

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-success text-success-foreground">Approved</Badge>;
    if (s === "rejected") return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
    return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <GovBanner />
      <div className="bg-primary px-6 py-3 text-primary-foreground">
        <span className="text-lg font-semibold">Agent Dashboard</span>
      </div>
      <div className="flex flex-1">
        <aside className="w-56 border-r bg-secondary">
          <nav className="flex flex-col gap-1 p-3">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors",
                  filter === f.value ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                )}
              >
                <f.icon className="h-4 w-4" /> {f.label}
              </button>
            ))}
            <button onClick={handleLogout} className="mt-4 flex items-center gap-2 rounded px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading applications...</p>
          ) : apps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.id}</TableCell>
                    <TableCell>{a.businessName}</TableCell>
                    <TableCell>{a.applicantName}</TableCell>
                    <TableCell>Class {a.category}</TableCell>
                    <TableCell>{a.submissionDate}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/agent/review/${a.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </main>
      </div>
    </div>
  );
}
