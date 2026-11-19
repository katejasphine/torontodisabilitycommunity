import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BookOpen, HeartHandshake, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recommendSupport } from "@/lib/recommend.functions";
import { CHALLENGE_MAX_CHARS, GENERAL_FUND_ID, validateChallenge, type Recommendation } from "@/lib/recommend";

const EXAMPLES = [
  "Getting around the city safely",
  "Accessible, affordable housing",
  "Being included when you can't hear well",
  "Fair chances at work and school",
];

function RecommendationLink({ rec }: { rec: Recommendation }) {
  const cls =
    "inline-flex items-center gap-1 font-bold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring";
  if (rec.kind === "story") {
    return (
      <Link to="/stories" hash={`story-${rec.id}`} className={cls}>
        Read the story <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    );
  }
  if (rec.id === GENERAL_FUND_ID) {
    return (
      <Link to="/donate" className={cls}>
        Give to the fund <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    );
  }
  return (
    <Link to="/campaigns/$slug" params={{ slug: rec.id }} className={cls}>
      See the appeal <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

export function SupportMatcher() {
  const fieldId = useId();
  const hintId = useId();
  const [text, setText] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const recommend = useServerFn(recommendSupport);
  const mutation = useMutation({
    mutationFn: (challenge: string) => recommend({ data: { challenge } }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validateChallenge(text);
    setInputError(problem);
    if (problem || mutation.isPending) return;
    mutation.mutate(text.trim());
  };

  const result = mutation.data;
  const failed = mutation.isError || (result && !result.ok);
  const errorMessage = mutation.isError
    ? "We couldn't find suggestions right now. Please try again."
    : result && !result.ok
      ? result.error
      : null;

  return (
    <section aria-labelledby={`${fieldId}-title`} className="rounded-3xl border border-border bg-paper p-6 shadow-card md:p-10">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <Sparkles aria-hidden="true" className="size-4" /> AI-powered suggestions
      </p>
      <h2 id={`${fieldId}-title`} className="mt-2 text-3xl font-semibold">Find where your support matters most</h2>
      <p className="mt-3 max-w-2xl text-lg">
        Tell us which accessibility challenges you care about, and we'll point you to the community stories and
        appeals that match.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor={fieldId} className="text-base font-bold">What would you like to help with?</Label>
          <Textarea
            id={fieldId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={CHALLENGE_MAX_CHARS}
            rows={4}
            aria-describedby={hintId}
            aria-invalid={inputError ? true : undefined}
            placeholder="For example: I want to help people who use wheelchairs get around Toronto more easily."
            className="bg-card text-base"
          />
          <p id={hintId} className="text-sm text-muted-foreground">
            Please don't include names or private details. What you type isn't saved; it's only used to find matches.
          </p>
          {inputError && <p role="alert" className="text-sm font-bold text-destructive">{inputError}</p>}
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Example topics">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setText(ex); setInputError(null); }}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {ex}
            </button>
          ))}
        </div>

        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <><Loader2 aria-hidden="true" className="animate-spin" /> Finding matches…</>
          ) : (
            "Show me where to help"
          )}
        </Button>
      </form>

      <div aria-live="polite" className="mt-8">
        {failed && errorMessage && (
          <p role="alert" className="rounded-2xl bg-notice p-4 font-semibold text-notice-foreground">{errorMessage}</p>
        )}
        {result?.ok && (
          <div>
            {result.summary && <p className="text-lg font-semibold">{result.summary}</p>}
            {result.recommendations.length === 0 ? (
              <p className="mt-2 text-muted-foreground">
                We didn't find a close match. Try describing a specific barrier, like transport, housing or communication.
              </p>
            ) : (
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {result.recommendations.map((rec) => (
                  <li key={`${rec.kind}-${rec.id}`} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {rec.kind === "story" ? (
                        <><BookOpen aria-hidden="true" className="size-4" /> Community story</>
                      ) : (
                        <><HeartHandshake aria-hidden="true" className="size-4" /> Appeal</>
                      )}
                    </p>
                    <h3 className="mt-2 font-display text-xl">{rec.title}</h3>
                    <p className="mt-2 flex-1 text-[0.95rem]">{rec.reason}</p>
                    <div className="mt-4"><RecommendationLink rec={rec} /></div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              Suggestions are made by AI from the stories and appeals on this site. Please read each one before giving.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
