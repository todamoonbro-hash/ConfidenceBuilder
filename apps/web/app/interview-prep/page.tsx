import { PageHeader } from "../../components/ui/page-header";
import { InterviewPrepStudio } from "../../components/modules/interview-prep-studio";

async function loadLibrary() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/interview/library`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as any;
  } catch {
    return null;
  }
}

export default async function InterviewPrepPage() {
  const library = await loadLibrary();
  return (
    <>
      <PageHeader
        kicker="Interview Prep"
        title="Mock interview rehearsal, answer coaching, and readiness training"
        subtitle="Practice out loud, refine stories, handle pressure, and build interview-ready confidence ethically."
      />
      <InterviewPrepStudio library={library} />
    </>
  );
}
