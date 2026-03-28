import { Suspense } from "react";
import ProposalExperience from "@/components/proposal-experience";

export default function ProposalPage() {
  return (
    <Suspense fallback={null}>
      <ProposalExperience />
    </Suspense>
  );
}
