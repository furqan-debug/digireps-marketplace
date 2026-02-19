import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserX, UserCheck, Users } from "lucide-react";
import { motion } from "framer-motion";

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

const ROLE_BADGE: Record<string, string> = {
  client:     "bg-blue-500/10 text-blue-600 border-blue-500/20",
  freelancer: "bg-primary/10 text-primary border-primary/20",
  admin:      "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const LEVEL_BADGE: Record<string, string> = {
  verified: "bg-secondary text-secondary-foreground",
  pro:      "bg-primary/10 text-primary",
  elite:    "bg-warning/15 text-warning",
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
        const { data: roles } = await supabase.from("user_roles").select("user_id, role");
        const roleMap = Object.fromEntries((roles ?? []).map((r) => [r.user_id, r.role]));
        const merged = (data ?? []).map((u) => ({ ...u, role: roleMap[u.user_id] ?? "client" }));
        setUsers(merged as UserRow[]);
        setLoading(false);
      });
  }, []);

  const toggleSuspend = async (u: UserRow) => {
    setActioning(u.user_id);
    const { error } = await supabase.from("profiles").update({ is_suspended: !u.is_suspended }).eq("user_id", u.user_id);
    setActioning(null);
    if (error) {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    } else {
      setUsers((prev) => prev.map((x) => x.user_id === u.user_id ? { ...x, is_suspended: !u.is_suspended } : x));
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
      setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, freelancer_level: level } : u));
      toast({ title: `Level set to ${level}` });
    }
  };

  const filtered = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.role ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Users</h1>
                <p className="text-muted-foreground text-sm">Manage all platform users.</p>
              </div>
            </div>
            <Input
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Level</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className={u.is_suspended ? "opacity-60 bg-muted/20" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/15 font-display font-bold text-primary text-sm">
                          {u.display_name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.display_name}</p>
                          {u.country && <p className="text-xs text-muted-foreground">{u.country}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${ROLE_BADGE[u.role ?? "client"] ?? ""} border capitalize text-xs`}>
                        {u.role ?? "client"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.is_suspended ? (
                        <Badge variant="destructive" className="text-xs">Suspended</Badge>
                      ) : (
                        <span className="text-xs text-success font-medium">Active</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.freelancer_level ? (
                        <Badge className={`${LEVEL_BADGE[u.freelancer_level] ?? ""} text-xs`}>{u.freelancer_level}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {u.role === "freelancer" && u.freelancer_level && (
                          <Select
                            value={u.freelancer_level}
                            onValueChange={(v) => upgradeLevel(u.user_id, v as "verified" | "pro" | "elite")}
                            disabled={actioning === u.user_id}
                          >
                            <SelectTrigger className="h-7 w-24 text-xs">
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
                          variant={u.is_suspended ? "outline" : "ghost"}
                          onClick={() => toggleSuspend(u)}
                          disabled={actioning === u.user_id}
                          className={`gap-1 h-7 text-xs ${!u.is_suspended ? "text-destructive hover:text-destructive hover:bg-destructive/10" : ""}`}
                        >
                          {actioning === u.user_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : u.is_suspended ? (
                            <><UserCheck className="h-3 w-3" /> Unsuspend</>
                          ) : (
                            <><UserX className="h-3 w-3" /> Suspend</>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminUsers;
