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
      <PageHeader title="Modules" subtitle="Choose one focused lab to build a specific speaking capability." kicker="Practice labs" />

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Recommended sequence</p>
        <p className="mt-1">Start with articulation or reading, run one timed speaking lab, then finish with media or executive pressure practice.</p>
      </section>

      <ArticulationStudio drills={drills} />
      <ReadingAloudLab passages={readingPassages} />
      <ImpromptuSpeakingLab />
      <ListeningResponseLab />
      <ExecutiveSimulationsLab />
      <MediaTrainingStudio drills={mediaDrills} />
    </>
  );
}
