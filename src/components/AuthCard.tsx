"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const providers = [
  { id: "facebook", label: "Facebook", color: "#3b5998", initials: "f" },
  { id: "google", label: "Google", color: "#ea4335", initials: "G" },
  { id: "linkedin", label: "LinkedIn", color: "#0a66c2", initials: "in" },
];

type Mode = "login" | "signup";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthCard({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("lumiu-remember-email");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const toggleMode = () => {
    setError("");
    setMode((current) => (current === "login" ? "signup" : "login"));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "signup" && !form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim() || !validateEmail(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = {
        email: form.email.trim(),
        password: form.password,
        ...(mode === "signup" ? { name: form.name.trim() } : {}),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to authenticate. Please try again.");
        setLoading(false);
        return;
      }

      if (form.rememberMe) {
        localStorage.setItem("lumiu-remember-email", form.email.trim());
      } else {
        localStorage.removeItem("lumiu-remember-email");
      }

      localStorage.setItem("user-authenticated", "true");
      localStorage.setItem("user-name", result.user?.name ?? "Explorer");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleProviderClick = (provider: string) => {
    console.log(`Mock OAuth login with ${provider}`);
    setError(`Mock ${provider} login is not configured yet.`);
  };

  return (
    <div className="auth-shell">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="auth-panel auth-panel--visual">
          <div className="auth-image-frame">
            <Image
              src="/login-illustration.jpg"
              alt="Login illustration"
              fill
              className="auth-image"
              priority
            />
          </div>
        </div>

        <div className="auth-panel auth-panel--form">
          <div className="auth-form-card">
            <div className="auth-headline">
              <h1>Welcome to Lumiu!</h1>
              <p>Please log in to get started</p>
            </div>

            {error ? <div className="auth-alert">{error}</div> : null}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === "signup" ? (
                <label className="auth-label">
                  <span>Name</span>
                  <input
                    type="text"
                    className="auth-input"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Enter your name"
                  />
                </label>
              ) : null}

              <label className="auth-label">
                <span>Email</span>
                <input
                  type="email"
                  className="auth-input"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="name@example.com"
                  required
                />
              </label>

              <label className="auth-label">
                <span>Password</span>
                <input
                  type="password"
                  className="auth-input"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="Enter your password"
                  required
                />
              </label>

              <div className="auth-row">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        rememberMe: event.target.checked,
                      }))
                    }
                  />
                  <span>Remember me</span>
                </label>

                <Link href="#" className="auth-link">
                  Forgot Password?
                </Link>
              </div>

              <button className="auth-button" type="submit" disabled={loading}>
                {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : mode === "login" ? "Login" : "Sign Up"}
              </button>
            </form>

            <div className="auth-toggle-row">
              <span>{mode === "login" ? "Don’t have an account?" : "Already have an account?"}</span>
              <button type="button" className="auth-toggle" onClick={toggleMode}>
                {mode === "login" ? "Sign Up" : "Login"}
              </button>
            </div>

            <div className="auth-divider">
              <span>Or</span>
            </div>

            <div className="auth-social-row">
              <span>Create an account with</span>
              <div className="auth-social-buttons">
                {providers.map((provider) => (
                  <button
                    type="button"
                    key={provider.id}
                    className="auth-social-button"
                    style={{ borderColor: provider.color }}
                    onClick={() => handleProviderClick(provider.label)}
                    aria-label={`Continue with ${provider.label}`}
                  >
                    <span>{provider.initials}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .auth-shell {
          min-height: 100vh;
          width: 100%;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, rgba(121, 90, 242, 0.18), transparent 30%),
            radial-gradient(circle at bottom right, rgba(137, 97, 245, 0.14), transparent 28%),
            #f1edff;
          font-family: var(--font-chillax), var(--font-primary), sans-serif;
        }

        .auth-card {
          width: min(1100px, 100%);
          max-width: 1120px;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          border-radius: 36px;
          overflow: hidden;
          background: #d6d1fa;
          box-shadow: 0 44px 120px rgba(104, 65, 211, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.7);
        }

        .auth-panel {
          position: relative;
        }

        .auth-panel--visual {
          min-height: 680px;
          background: linear-gradient(180deg, #2c1a62 0%, #4a2db2 100%);
        }

        .auth-image-frame {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 680px;
          overflow: hidden;
        }

        .auth-image {
          object-fit: cover;
          filter: brightness(0.96) saturate(1.04);
          transform: scale(1.02);
        }

        .auth-panel--form {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 72px 64px;
          background: rgba(255, 255, 255, 0.95);
        }

        .auth-form-card {
          width: 100%;
          max-width: 420px;
        }

        .auth-headline h1 {
          margin: 0;
          font-size: clamp(2.4rem, 3.5vw, 3.2rem);
          line-height: 1.02;
          color: #6e2cf3;
          letter-spacing: -0.03em;
        }

        .auth-headline p {
          margin: 14px 0 0;
          color: #5c3dc8;
          font-size: 1rem;
          opacity: 0.92;
        }

        .auth-alert {
          margin-top: 24px;
          padding: 16px 18px;
          border-radius: 18px;
          background: #fde8ff;
          color: #7f1dff;
          font-weight: 600;
          border: 1px solid #e9d5ff;
        }

        .auth-form {
          margin-top: 36px;
          display: grid;
          gap: 18px;
        }

        .auth-label {
          display: grid;
          gap: 10px;
          color: #3b2b6e;
          font-weight: 700;
          font-size: 0.98rem;
        }

        .auth-input {
          width: 100%;
          padding: 18px 22px;
          border-radius: 18px;
          border: 1px solid rgba(126, 94, 255, 0.3);
          background: rgba(243, 238, 255, 0.88);
          color: #3f2d76;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .auth-input:hover {
          border-color: rgba(126, 94, 255, 0.55);
        }

        .auth-input:focus {
          border-color: #6e2cf3;
          box-shadow: 0 0 0 6px rgba(151, 126, 255, 0.15);
          background: #ffffff;
        }

        .auth-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .auth-checkbox {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #5c4bbc;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .auth-checkbox input {
          width: 18px;
          height: 18px;
          accent-color: #6e2cf3;
        }

        .auth-link {
          color: #7a46f6;
          font-weight: 600;
          text-decoration: none;
          font-size: 0.95rem;
          transition: opacity 0.2s ease;
        }

        .auth-link:hover {
          opacity: 0.8;
        }

        .auth-button {
          width: 100%;
          padding: 18px 24px;
          margin-top: 6px;
          border-radius: 20px;
          border: none;
          background: #a388f6;
          color: white;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 18px 40px rgba(163, 136, 246, 0.26);
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 22px 48px rgba(163, 136, 246, 0.33);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-toggle-row {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #5c4bbc;
          font-size: 0.95rem;
        }

        .auth-toggle {
          background: transparent;
          border: none;
          color: #6e2cf3;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          transition: opacity 0.2s ease;
        }

        .auth-toggle:hover {
          opacity: 0.8;
        }

        .auth-divider {
          margin: 34px 0 0;
          display: flex;
          align-items: center;
          gap: 18px;
          color: #8071d8;
          font-weight: 700;
          font-size: 0.88rem;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(134, 115, 249, 0.24);
        }

        .auth-social-row {
          margin-top: 24px;
          display: grid;
          gap: 16px;
          justify-items: center;
          text-align: center;
        }

        .auth-social-row span {
          color: #6050b7;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .auth-social-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .auth-social-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid rgba(115, 92, 247, 0.35);
          background: white;
          color: #3b2a82;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .auth-social-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(110, 44, 243, 0.13);
          background: #f6f0ff;
        }

        @media (max-width: 1024px) {
          .auth-card {
            grid-template-columns: 1fr;
          }

          .auth-panel--visual {
            min-height: 360px;
          }

          .auth-form-card {
            padding-top: 16px;
          }
        }

        @media (max-width: 720px) {
          .auth-shell {
            padding: 20px;
          }

          .auth-card {
            border-radius: 28px;
          }

          .auth-panel--form {
            padding: 40px 24px;
          }

          .auth-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .auth-social-buttons {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
