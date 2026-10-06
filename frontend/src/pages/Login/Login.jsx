import { useState } from "react";
import {
  AudioWaveform,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Mic2,
  Radio,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      login(data.token, data.data);

      console.log("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-grid" />

      <div className="login-shell">
        <section className="login-showcase">
          <div className="showcase-top">
            <div className="brand-mark">
              <Mic2 size={22} />
            </div>

            <div>
              <span className="brand-name">
                DESIGN RECORDER
              </span>

              <span className="brand-version">
                STUDIO
              </span>
            </div>
          </div>

          <div className="showcase-content">
            <div className="live-badge">
              <span className="live-dot" />
              AUDIO CAPTURE SYSTEM
            </div>

            <h1>
              Capture every
              <span> important moment.</span>
            </h1>

            <p>
              Record, manage and monitor your audio
              sessions from one intelligent workspace.
            </p>

            <div className="waveform-container">
              <div className="waveform-label">
                <span>
                  <Radio size={14} />
                  SYSTEM READY
                </span>

                <span>48 kHz · STEREO</span>
              </div>

              <div className="login-waveform">
                {Array.from(
                  { length: 42 },
                  (_, index) => (
                    <span
                      key={index}
                      style={{
                        "--bar-height": `${
                          18 +
                          ((index * 17) % 48)
                        }px`,
                        "--bar-delay": `${
                          index * 0.035
                        }s`,
                      }}
                    />
                  )
                )}
              </div>

              <div className="waveform-line" />
            </div>

            <div className="showcase-features">
              <div>
                <AudioWaveform size={17} />
                <span>High quality recording</span>
              </div>

              <div>
                <ShieldCheck size={17} />
                <span>Secure authenticated sessions</span>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span>DESIGNED FOR FOCUSED WORK</span>
            <span>● ONLINE</span>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <div className="login-card-header">
              <div className="login-icon">
                <Mic2 size={22} />
              </div>

              <div>
                <p className="eyebrow">
                  WELCOME BACK
                </p>

                <h2>Sign in to your studio</h2>
              </div>
            </div>

            <p className="login-description">
              Access your recordings and continue
              where you left off.
            </p>

            {error && (
              <div className="login-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >
              <div className="login-field">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <Mail size={18} />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="field-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <span>SECURE ACCESS</span>
                </div>

                <div className="input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Enter Studio
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-security">
              <ShieldCheck size={16} />

              <span>
                Your session is protected with
                encrypted authentication.
              </span>
            </div>
          </div>

          <p className="login-copyright">
            DESIGN RECORDER · AUDIO WORKSPACE
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;