import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="mb-4 border-none bg-[#1c1c1c] shadow-none">
      <CardHeader className="py-3 px-4 border-b border-border/40">
        <CardTitle className="text-base font-medium flex justify-between items-center">
          <span>Resume-Job Match Analysis</span>
          {onRefreshRequest && (
            <Button
              onClick={onRefreshRequest}
              size="sm"
              variant="outline"
              className="h-7 text-xs rounded-md"
            >
              Refresh Analysis
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4 px-4">
        {score !== undefined ? (
          <>
            {/* Skills, Experience, Education Grid at Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {topSkillMatches && topSkillMatches.length > 0 && (
                <div>
                  <h4 className="font-medium text-xs mb-2 text-muted-foreground">
                    Top Matching Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {topSkillMatches.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#1a1a1a] text-[#f1f1f1] border border-[#333]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {missingSkills && missingSkills.length > 0 && (
                <div>
                  <h4 className="font-medium text-xs mb-2 text-muted-foreground">
                    Skills to Develop
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#1a1a1a] text-[#f1f1f1] border border-[#333]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Match Score Circle */}
            <div className="flex justify-center mb-6">
              <div className="flex-shrink-0 text-center">
                <div className="relative w-28 h-28 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-border/40 flex flex-col items-center justify-center">
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
                    <span
                      className={`text-xs mt-1 ${
                        score >= 70
                          ? "text-green-500"
                          : score >= 50
                            ? "text-amber-500"
                            : "text-red-500"
                      } flex items-center`}
                    >
                      {score >= 70 ? (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-3 w-3 mr-1"
                            stroke="currentColor"
                          >
                            <path
                              d="M9 12l2 2 4-4"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Strong Match
                        </>
                      ) : score >= 50 ? (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-3 w-3 mr-1"
                            stroke="currentColor"
                          >
                            <path
                              d="M12 8v4m0 4h.01"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Partial Match
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-3 w-3 mr-1"
                            stroke="currentColor"
                          >
                            <path
                              d="M6 18L18 6M6 6l12 12"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Low Match
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-center mt-1 text-xs text-muted-foreground">
                  {matchedAt &&
                    `Updated: ${new Date(matchedAt).toLocaleString()}`}
                </div>
              </div>
            </div>

            {/* AI Analysis Below */}
            {comments && (
              <div className="mt-2 border-t border-border/40 pt-4">
                <h3 className="text-sm font-semibold mb-2">AI Analysis</h3>
                <div className="text-sm text-[#f1f1f1]">{comments}</div>
              </div>
            )}

            <div className="mt-4 w-full bg-[#333] rounded-full h-1">
              <div
                className={`h-1 rounded-full ${
                  score >= 70
                    ? "bg-green-500"
                    : score >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-3 text-sm">
              No match analysis available yet.
            </p>
            {onRefreshRequest && (
              <Button
                onClick={onRefreshRequest}
                size="sm"
                variant="default"
                className="bg-primary hover:bg-primary/90"
              >
                Generate Match Analysis
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
