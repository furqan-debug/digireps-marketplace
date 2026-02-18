import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserX, UserCheck, Shield } from "lucide-react";

type UserRow = {
  id: string;
  user_id: string;
  display_name: string;
  country: string | null;
  application_status: string | null;
  is_suspended: boolean;
  freelancer_level: "verified" | "pro" | "elite" | null;
  role?: string;
};

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, user_id, display_name, country, application_status, is_suspended, freelancer_level")
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        // Fetch roles
        const { data: roles } = await supabase.from("user_roles").select("user_id, role");
        const roleMap = Object.fromEntries((roles ?? []).map((r) => [r.user_id, r.role]));
        const merged = (data ?? []).map((u) => ({ ...u, role: roleMap[u.user_id] ?? "client" }));
        setUsers(merged as UserRow[]);
        setLoading(false);
      });
  }, []);

  const toggleSuspend = async (u: UserRow) => {
    setActioning(u.user_id);
    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: !u.is_suspended })
      .eq("user_id", u.user_id);
    setActioning(null);
    if (error) {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    } else {
      setUsers((prev) =>
        prev.map((x) => x.user_id === u.user_id ? { ...x, is_suspended: !u.is_suspended } : x)
      );
      toast({ title: u.is_suspended ? "User unsuspended" : "User suspended" });
    }
  };

  const upgradeLevel = async (userId: string, level: "verified" | "pro" | "elite") => {
    setActioning(userId);
    const { error } = await supabase.from("profiles").update({ freelancer_level: level }).eq("user_id", userId);
    setActioning(null);
    if (error) {
      toast({ title: "Failed to upgrade level", description: error.message, variant: "destructive" });
    } else {
      setUsers((prev) =>
        prev.map((u) => u.user_id === userId ? { ...u, freelancer_level: level } : u)
      );
      toast({ title: `Level set to ${level}` });
    }
  };

  const LEVEL_COLOR: Record<string, string> = {
    verified: "bg-secondary text-secondary-foreground",
    pro: "bg-primary/10 text-primary",
    elite: "bg-warning/15 text-warning",
  };

  const filtered = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.role ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground mt-1">Manage all platform users.</p>
          </div>
          <Input
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((u) => (
              <Card key={u.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{u.display_name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{u.role}</Badge>
                        {u.is_suspended && <Badge variant="destructive" className="text-xs">Suspended</Badge>}
                        {u.freelancer_level && (
                          <Badge className={`text-xs ${LEVEL_COLOR[u.freelancer_level]}`}>
                            {u.freelancer_level}
                          </Badge>
                        )}
                      </div>
                      {u.country && <p className="text-xs text-muted-foreground">{u.country}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {u.role === "freelancer" && u.freelancer_level && (
                        <Select
                          value={u.freelancer_level}
                          onValueChange={(v) => upgradeLevel(u.user_id, v as "verified" | "pro" | "elite")}
                          disabled={actioning === u.user_id}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        size="sm"
                        variant={u.is_suspended ? "outline" : "destructive"}
                        onClick={() => toggleSuspend(u)}
                        disabled={actioning === u.user_id}
                        className="gap-1.5"
                      >
                        {actioning === u.user_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : u.is_suspended ? (
                          <><UserCheck className="h-3.5 w-3.5" /> Unsuspend</>
                        ) : (
                          <><UserX className="h-3.5 w-3.5" /> Suspend</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No users found.</CardContent></Card>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminUsers;
