import { PageHeader } from "../../components/ui/page-header";
import { ArticulationStudio } from "../../components/modules/articulation-studio";
import { ExecutiveSimulationsLab } from "../../components/modules/executive-simulations-lab";
import { ImpromptuSpeakingLab } from "../../components/modules/impromptu-speaking-lab";
import { ListeningResponseLab } from "../../components/modules/listening-response-lab";
import { MediaTrainingStudio } from "../../components/modules/media-training-studio";
import { ReadingAloudLab } from "../../components/modules/reading-aloud-lab";

type ArticulationDrill = {
  id: string;
  name: string;
  instruction: string;
  examplePhrase: string;
  targetFocus: string;
  difficultyLevel: "Easy" | "Moderate" | "Challenging";
};

async function loadArticulationDrills(): Promise<ArticulationDrill[]> {
  try {
    const response = await fetch("http://localhost:4000/v1/modules/articulation/drills", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { drills?: ArticulationDrill[] };
    return payload.drills ?? [];
  } catch {
    return [];
  }
}

export default async function ModulesPage() {
  const drills = await loadArticulationDrills();
  const mediaDrills = await (async () => {
    try {
      const response = await fetch("http://localhost:4000/v1/modules/media/drills", { cache: "no-store" });
      if (!response.ok) return [];
      const payload = (await response.json()) as { drills?: Array<any> };
      return payload.drills ?? [];
    } catch {
      return [];
    }
  })();
  const readingPassages = await (async () => {
    try {
      const response = await fetch("http://localhost:4000/v1/modules/reading/passages", { cache: "no-store" });
      if (!response.ok) return [];
      const payload = (await response.json()) as { passages?: Array<any> };
      return payload.passages ?? [];
    } catch {
      return [];
    }
  })();

  return (
    <>
      <PageHeader 
        kicker="Training labs"
        title="Practice modules" 
        subtitle="Pick one focused lab to build a specific speaking capability. Start with foundations, progress to advanced scenarios." 
      />

      {/* Lab sequence guide */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Suggested sequence</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
          <p><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white mr-2">1</span>Articulation or Reading</p>
          <p><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white mr-2">2</span>Impromptu or Listening</p>
          <p><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white mr-2">3</span>Media or Executive Pressure</p>
        </div>
      </section>

      <div className="space-y-6">
        <ArticulationStudio drills={drills} />
        <ReadingAloudLab passages={readingPassages} />
        <ImpromptuSpeakingLab />
        <ListeningResponseLab />
        <ExecutiveSimulationsLab />
        <MediaTrainingStudio drills={mediaDrills} />
      </div>
    </>
  );
}
