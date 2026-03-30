import { useState } from "react";
import BorderGlow from "./components/BorderGlow";
import Silk from "./components/Silk";
import "./App.css";

const MAX_CUSTOM_CODE_LENGTH = 10;
const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  ""
);

const normalizeErrorMessage = (detail) => {
  if (!detail) return "";
  if (typeof detail === "string") return detail;

  if (typeof detail === "object") {
    const messageParts = [detail.message, detail.details, detail.detail].filter(
      Boolean
    );
    return messageParts.join(" ");
  }

  return String(detail);
};

const isAliasConflictError = (message) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("alias taken") ||
    normalized.includes("duplicate key value") ||
    normalized.includes("urls_short_code_key") ||
    normalized.includes("short_code") ||
    normalized.includes("already exists")
  );
};

function App() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiry, setExpiry] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aliasError, setAliasError] = useState("");
  const [formError, setFormError] = useState("");

  const handleShorten = async () => {
    if (!url) return;

    setLoading(true);
    setAliasError("");
    setFormError("");

    try {
      if (customCode && customCode.length > MAX_CUSTOM_CODE_LENGTH) {
        setAliasError(
          `Alias must be ${MAX_CUSTOM_CODE_LENGTH} characters or fewer.`
        );
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({ original_url: url });

      if (customCode) {
        params.set("custom_code", customCode);
      }

      if (expiry) {
        params.set("expiry_minutes", expiry);
      }

      const response = await fetch(`${API}/shorten?${params}`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.status !== 200) {
        const message = normalizeErrorMessage(data.detail);

        if (isAliasConflictError(message)) {
          setAliasError(
            "That alias is already taken. Try a shorter, more unique handle."
          );
        } else {
          setFormError(message || "Something went wrong while shortening the URL.");
        }
      } else {
        setShortUrl(data.short_url);
        setStats(null);
        setAliasError("");
        setFormError("");
      }
    } catch (error) {
      setFormError("Unable to reach the server right now. Please try again.");
    }

    setLoading(false);
  };

  const handleStats = async () => {
    const code = shortUrl.split("/").pop();

    try {
      const response = await fetch(`${API}/stats/${code}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      alert("Error fetching stats");
    }
  };

  const adjustExpiry = (delta) => {
    const currentValue = Number.parseInt(expiry || "0", 10);
    const nextValue = Math.max(currentValue + delta, 0);
    setExpiry(nextValue === 0 ? "" : String(nextValue));
  };

  return (
    <main className="app-shell">
      <div className="app-background" aria-hidden="true">
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      <div className="app-overlay" aria-hidden="true" />

      <section className="dashboard">
        <header className="dashboard__hero">
          <p className="dashboard__eyebrow">Link control center</p>
          <h1>URL Shortener Dashboard</h1>
          <p>
            Paste a long URL, generate a short link, and check click activity
            from one compact workspace.
          </p>
        </header>

        <BorderGlow
          edgeSensitivity={68}
          glowColor="255 255 255"
          backgroundColor="#10051d"
          borderRadius={30}
          glowRadius={54}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={["#fff7ed", "#c084fc", "#38bdf8", "#f472b6", "#fff7ed"]}
          className="dashboard__card-glow"
        >
          <section className="dashboard__card">
            <p className="dashboard__label">Enter a destination URL</p>

            <div className="url-form">
              <BorderGlow
                edgeSensitivity={30}
                glowColor="56 189 248"
                backgroundColor="#060010"
                borderRadius={28}
                glowRadius={40}
                glowIntensity={0.9}
                coneSpread={25}
                animated={false}
                colors={["#c084fc", "#f472b6", "#38bdf8"]}
                className="url-input-shell"
              >
                <div className="url-input-shell__content">
                  <span className="url-input-shell__accent" aria-hidden="true" />
                  <input
                    className="url-input"
                    type="text"
                    placeholder="https://example.com/your-very-long-link"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                  />
                </div>
              </BorderGlow>

              <button
                className="shorten-button"
                onClick={handleShorten}
                disabled={loading || !url}
              >
                {loading ? "Shortening..." : "Shorten"}
              </button>
            </div>

            <div className="url-options">
              <BorderGlow
                edgeSensitivity={24}
                glowColor="192 132 252"
                backgroundColor="#080112"
                borderRadius={22}
                glowRadius={28}
                glowIntensity={0.7}
                coneSpread={22}
                animated={false}
                colors={["#c084fc", "#f472b6", "#38bdf8"]}
                className="option-input-shell"
              >
                <div className="option-input-shell__content">
                  <span className="option-input-shell__label">Alias</span>
                  <input
                    className="option-input"
                    type="text"
                    placeholder="Custom alias (optional)"
                    value={customCode}
                    onChange={(event) => {
                      setCustomCode(event.target.value);
                      if (aliasError) {
                        setAliasError("");
                      }
                      if (formError) {
                        setFormError("");
                      }
                    }}
                    maxLength={MAX_CUSTOM_CODE_LENGTH}
                  />
                </div>
              </BorderGlow>

              {aliasError && (
                <div className="alias-feedback" role="alert" aria-live="polite">
                  <span className="alias-feedback__dot" aria-hidden="true" />
                  <span>{aliasError}</span>
                </div>
              )}

              <BorderGlow
                edgeSensitivity={24}
                glowColor="56 189 248"
                backgroundColor="#080112"
                borderRadius={22}
                glowRadius={28}
                glowIntensity={0.7}
                coneSpread={22}
                animated={false}
                colors={["#38bdf8", "#c084fc", "#f472b6"]}
                className="option-input-shell"
              >
                <div className="option-input-shell__content">
                  <span className="option-input-shell__label">Expiry</span>
                  <div className="option-input-row">
                    <input
                      className="option-input option-input--number"
                      type="number"
                      min="1"
                      placeholder="Expiry in minutes (optional)"
                      value={expiry}
                      onChange={(event) => setExpiry(event.target.value)}
                    />
                    <div className="expiry-stepper">
                      <button
                        type="button"
                        className="expiry-stepper__button"
                        onClick={() => adjustExpiry(5)}
                        aria-label="Increase expiry by 5 minutes"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="expiry-stepper__button"
                        onClick={() => adjustExpiry(-5)}
                        aria-label="Decrease expiry by 5 minutes"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            </div>

            {formError && (
              <div className="form-feedback" role="alert" aria-live="polite">
                <span className="form-feedback__dot" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            {shortUrl && (
              <div className="result-card">
                <span className="result-card__label">Short URL</span>
                <a
                  className="result-card__link"
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortUrl}
                </a>
                <button className="stats-button" onClick={handleStats}>
                  View Stats
                </button>
              </div>
            )}

            {stats && (
              <div className="stats-card">
                <span className="stats-card__label">Total Clicks</span>
                <p className="stats-card__value">{stats.total_clicks}</p>
              </div>
            )}
          </section>
        </BorderGlow>
      </section>
    </main>
  );
}

export default App;
