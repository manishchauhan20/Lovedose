import { Suspense } from "react";
import ProposalExperience from "@/components/Praposal-section/Girlfriend-Collection/proposal-experience";

export default function ProposalPage() {
  return (
    <Suspense fallback={null}>
      <ProposalExperience />
    </Suspense>
  );
}
