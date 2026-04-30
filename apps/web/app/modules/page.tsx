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
    const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/modules/articulation/drills`, { cache: "no-store" });
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
      const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/modules/media/drills`, { cache: "no-store" });
      if (!response.ok) return [];
      const payload = (await response.json()) as { drills?: Array<any> };
      return payload.drills ?? [];
    } catch {
      return [];
    }
  })();
  const readingPassages = await (async () => {
    try {
      const response = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/v1/modules/reading/passages`, { cache: "no-store" });
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
        kicker="Skill labs"
        title="All training modules"
        subtitle="Foundations first (Articulation, Reading), then pressure (Impromptu, Listening), then presence (Executive, Media)."
        action={{ label: "← Back to Practice", href: "/practice" }}
      />

      <div className="space-y-6">
        <div id="articulation" className="scroll-mt-24">
          <ArticulationStudio drills={drills} />
        </div>
        <div id="reading" className="scroll-mt-24">
          <ReadingAloudLab passages={readingPassages} />
        </div>
        <div id="impromptu" className="scroll-mt-24">
          <ImpromptuSpeakingLab />
        </div>
        <div id="listening" className="scroll-mt-24">
          <ListeningResponseLab />
        </div>
        <div id="executive" className="scroll-mt-24">
          <ExecutiveSimulationsLab />
        </div>
        <div id="media" className="scroll-mt-24">
          <MediaTrainingStudio drills={mediaDrills} />
        </div>
      </div>
    </>
  );
}
