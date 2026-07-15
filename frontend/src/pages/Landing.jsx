import { Link } from "react-router-dom";
import ScoreRing from "../components/ScoreRing";

export default function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="inline-block rounded-full bg-moss-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-moss-600">
            AI-ranked room matching
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Renting a room shouldn't feel like a gamble.
          </h1>
          <p className="mt-4 max-w-md text-slatex-600">
            RooMatch scores every listing against your budget, location and lifestyle — so
            you only spend time on rooms and flatmates that actually fit.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/register" className="btn-primary">
              Find a room
            </Link>
            <Link to="/register" className="btn-secondary">
              List a room
            </Link>
          </div>
        </div>

        <div className="card mx-auto flex w-full max-w-sm flex-col gap-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slatex-400">Sample match</p>
          <div className="flex items-center gap-4">
            <ScoreRing score={87} size={72} />
            <div>
              <p className="font-display text-lg font-semibold">2BHK in Kothrud</p>
              <p className="text-sm text-slatex-600">₹14,000/mo · semi-furnished</p>
            </div>
          </div>
          <p className="rounded-lg bg-moss-50 p-3 text-sm italic text-moss-700">
            "Rent fits comfortably within budget and the location matches your preferred area —
            strong overall fit."
          </p>
        </div>
      </div>

      <div className="mt-24 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Post or browse", body: "Owners list rooms with photos and rent. Tenants set a budget and preferred areas." },
          { title: "Get scored, ranked", body: "An LLM compares each listing to your profile and returns a 0–100 compatibility score." },
          { title: "Chat in real time", body: "Once interest is accepted, message instantly — no waiting on email back-and-forth." },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm text-slatex-600">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
