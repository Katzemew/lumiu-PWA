"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

type Mode = "login" | "signup";

const providers = [
  { id: "google", label: "Google", initials: "G" },
  { id: "facebook", label: "Facebook", initials: "f" },
  { id: "linkedin", label: "LinkedIn", initials: "in" },
];

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const MIN_PASSWORD_LENGTH = 6;

export function SupabaseAuthCard({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("lumiu-remember-email");
    if (storedEmail) {
      setForm((prev) => ({ ...prev, email: storedEmail, rememberMe: true }));
    }
  }, []);

  const validateField = (name: keyof typeof form, value: string) => {
    if (name === "email") {
      if (!value.trim()) return "Email is required.";
      if (!validateEmail(value)) return "Enter a valid email address.";
      return "";
    }

    if (name === "password") {
      if (!value) return "Password is required.";
      if (value.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
      return "";
    }

    if (name === "name" && mode === "signup") {
      if (!value.trim()) return "Name is required for signup.";
      return "";
    }

    return "";
  };

  const updateField = (name: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name !== "rememberMe") {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, String(value)) }));
    }
  };

  const toggleMode = () => {
    setFormError("");
    setFieldErrors({ name: "", email: "", password: "" });
    setMode((current) => (current === "login" ? "signup" : "login"));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const nameError = mode === "signup" ? validateField("name", form.name) : "";
    const emailError = validateField("email", form.email);
    const passwordError = validateField("password", form.password);

    setFieldErrors({ name: nameError, email: emailError, password: passwordError });

    if (nameError || emailError || passwordError) {
      setFormError("Please fix the highlighted fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      if (form.rememberMe) {
        localStorage.setItem("lumiu-remember-email", form.email.trim());
      } else {
        localStorage.removeItem("lumiu-remember-email");
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });

        if (error) {
          setFormError(error.message);
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { full_name: form.name.trim() },
          },
        });

        if (error) {
          setFormError(error.message);
          setLoading(false);
          return;
        }
      }

      localStorage.setItem("user-authenticated", "true");
      localStorage.setItem("user-name", mode === "signup" ? form.name.trim() : "Learner");
      router.push("/dashboard");
    } catch (error: any) {
      setFormError(error?.message || "Unable to complete authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setFormError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as "google" | "facebook" | "linkedin",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setFormError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D6D1FA] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto grid max-w-[1120px] overflow-hidden rounded-[36px] border border-white/80 bg-white/90 shadow-[0_40px_120px_rgba(109,41,255,0.14)] md:grid-cols-[1.1fr_1fr]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="relative min-h-[380px] bg-[#3b2a82] sm:min-h-[520px]">
          <Image
            src="/login-illustration.jpg"
            alt="Space illustration"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#271b6c]/40 via-transparent to-[#271b6c]/70" />
        </div>

        <div className="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-3 text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-[#6E2CF3]">Welcome to Lumiu!</h1>
              <p className="text-base text-[#4A3F8D]">Please {mode === "login" ? "log in" : "sign up"} to get started.</p>
            </div>

            {formError ? (
              <div className="mb-6 rounded-3xl border border-[#E4D5FF] bg-[#FFF5FF] p-4 text-sm text-[#7F2CF3] shadow-sm">
                {formError}
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F8D]">Name</label>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={`mt-2 w-full rounded-3xl border px-4 py-4 text-base text-slate-900 outline-none transition ${
                      fieldErrors.name ? "border-[#F2A1F8] bg-[#FFF0FF]" : "border-[#D8CEFF] bg-[#F4F0FF]"
                    } hover:border-[#A388F6] focus:border-[#6E2CF3]`}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                  {fieldErrors.name ? <p className="mt-2 text-sm text-[#A240D9]">{fieldErrors.name}</p> : null}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#4A3F8D]">Email</label>
                <input
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={`mt-2 w-full rounded-3xl border px-4 py-4 text-base text-slate-900 outline-none transition ${
                    fieldErrors.email ? "border-[#F2A1F8] bg-[#FFF0FF]" : "border-[#D8CEFF] bg-[#F4F0FF]"
                  } hover:border-[#A388F6] focus:border-[#6E2CF3]`}
                  placeholder="name@example.com"
                  type="email"
                  autoComplete="email"
                />
                {fieldErrors.email ? <p className="mt-2 text-sm text-[#A240D9]">{fieldErrors.email}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4A3F8D]">Password</label>
                <input
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className={`mt-2 w-full rounded-3xl border px-4 py-4 text-base text-slate-900 outline-none transition ${
                    fieldErrors.password ? "border-[#F2A1F8] bg-[#FFF0FF]" : "border-[#D8CEFF] bg-[#F4F0FF]"
                  } hover:border-[#A388F6] focus:border-[#6E2CF3]`}
                  placeholder="Create a secure password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                {fieldErrors.password ? <p className="mt-2 text-sm text-[#A240D9]">{fieldErrors.password}</p> : null}
              </div>

              <div className="flex items-center justify-between gap-4 text-sm text-[#5C4BBC] sm:text-base">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(event) => updateField("rememberMe", event.target.checked)}
                    className="h-5 w-5 rounded border-[#D8CEFF] bg-white text-[#6E2CF3] focus:ring-[#A388F6]"
                  />
                  Remember me
                </label>
                <Link href="#" className="font-semibold text-[#6E2CF3] transition hover:opacity-80">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-[#A388F6] px-5 py-4 text-base font-semibold text-white shadow-[0_14px_40px_rgba(163,136,246,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(163,136,246,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : mode === "login" ? "Login" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#5C4BBC] sm:text-base">
              <span>{mode === "login" ? "Don’t have an account?" : "Already have an account?"}</span>{" "}
              <button type="button" onClick={toggleMode} className="font-semibold text-[#6E2CF3] transition hover:opacity-80">
                {mode === "login" ? "Sign Up" : "Login"}
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-[#8A75E8]">
              <span className="h-px flex-1 bg-[#D8CEFF]" />
              <span>Or</span>
              <span className="h-px flex-1 bg-[#D8CEFF]" />
            </div>

            <div className="mt-6 text-center text-sm text-[#5C4BBC] sm:text-base">Create an account with</div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleOAuth(provider.id)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D8CEFF] bg-white text-lg font-semibold text-[#4E3DB9] shadow-[0_10px_24px_rgba(109,41,255,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#F6F0FF]"
                  aria-label={`Continue with ${provider.label}`}
                >
                  {provider.initials}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
