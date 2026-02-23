import { ShieldCheck } from "lucide-react";

interface VerifiedInput {
  application_status: string | null;
  is_suspended: boolean;
  profile_completion_score: number;
}

export function getVerifiedStatus(profile: VerifiedInput) {
  const isVerified =
    profile.application_status === "approved" &&
    !profile.is_suspended &&
    profile.profile_completion_score >= 80;

  return {
    isVerified,
    label: isVerified ? "Verified" : "",
    icon: ShieldCheck,
  };
}
