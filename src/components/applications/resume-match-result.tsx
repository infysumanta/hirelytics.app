import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MatchResultProps {
  score?: number;
  comments?: string;
  matchedAt?: string;
  topSkillMatches?: string[];
  missingSkills?: string[];
  onRefreshRequest?: () => void;
}

export default function ResumeMatchResult({
  score,
  comments,
  matchedAt,
  topSkillMatches,
  missingSkills,
  onRefreshRequest,
}: MatchResultProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Resume-Job Match Analysis</span>
          {onRefreshRequest && (
            <Button onClick={onRefreshRequest} size="sm" variant="outline">
              Refresh Analysis
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {score !== undefined ? (
          <>
            <div className="flex flex-col md:flex-row md:items-start mb-4">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-muted flex items-center justify-center">
                    <span
                      className={`text-4xl font-bold ${
                        score >= 70
                          ? "text-green-500"
                          : score >= 50
                            ? "text-amber-500"
                            : "text-red-500"
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border">
                    {score >= 70 ? (
                      <span className="text-green-500">✓ Strong match</span>
                    ) : score >= 50 ? (
                      <span className="text-amber-500">◐ Potential match</span>
                    ) : (
                      <span className="text-red-500">✗ Low match</span>
                    )}
                  </div>
                </div>
                <div className="text-center mt-2 text-xs text-muted-foreground">
                  {matchedAt
                    ? `Updated: ${new Date(matchedAt).toLocaleString()}`
                    : ""}
                </div>
              </div>

              <div className="flex-grow border-t md:border-t-0 md:border-l border-dashed border-muted pt-4 md:pt-0 md:pl-6">
                {comments && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">AI Analysis</h4>
                    <div className="text-sm whitespace-pre-line bg-muted p-4 rounded-md">
                      {comments}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {topSkillMatches && topSkillMatches.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1 text-green-600">
                        Top Matching Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {topSkillMatches.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {missingSkills && missingSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1 text-amber-600">
                        Skills to Develop
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {missingSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Progress
              value={score}
              className={`h-2 mt-2 ${
                score >= 70
                  ? "bg-green-100"
                  : score >= 50
                    ? "bg-amber-100"
                    : "bg-red-100"
              }`}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No match analysis available yet.
            </p>
            {onRefreshRequest && (
              <Button onClick={onRefreshRequest}>
                Generate Match Analysis
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
