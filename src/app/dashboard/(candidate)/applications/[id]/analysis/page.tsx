import { ResumeAnalysis } from "@/components/applications/resume-analysis";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationAnalysisPage(props: Props) {
  const params = await props.params;
  const applicationId = params.id;

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <ResumeAnalysis applicationId={applicationId} />
    </div>
  );
}
