import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getConfigStatus, testConnection, insertContact } from "../lib/supabase";

// Types
type CheckStatus = "pending" | "checking" | "success" | "error";

type SetupCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  error?: string;
  hint?: string;
};

type FormError = { field: string; message: string; hint: string };

type SubmitState =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success" }
  | { state: "error"; errors: FormError[]; type: string };

// Validation helpers
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(data: { name: string; email: string; message: string }): FormError[] {
  const errors: FormError[] = [];

  if (!data.name.trim()) {
    errors.push({
      field: "name",
      message: "Name is required",
      hint: "Tell us who you are so we can address you properly",
    });
  } else if (data.name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name is too short",
      hint: "Please enter at least 2 characters",
    });
  }

  if (!data.email.trim()) {
    errors.push({
      field: "email",
      message: "Email is required",
      hint: "We need your email to respond to your message",
    });
  } else if (!validateEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Invalid email format",
      hint: "Make sure your email looks like: you@example.com",
    });
  }

  if (!data.message.trim()) {
    errors.push({
      field: "message",
      message: "Message is required",
      hint: "What would you like to tell us?",
    });
  } else if (data.message.trim().length < 10) {
    errors.push({
      field: "message",
      message: "Message is too short",
      hint: "Please write at least 10 characters so we can understand your request",
    });
  }

  return errors;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Check item component
function CheckItem({ check }: { check: SetupCheck }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3"
    >
      {/* Status icon */}
      <div className="mt-0.5">
        {check.status === "pending" && (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        )}
        {check.status === "checking" && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full"
          />
        )}
        {check.status === "success" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
        {check.status === "error" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Label and details */}
      <div className="flex-1">
        <p className={`font-medium ${
          check.status === "success" ? "text-green-700" :
          check.status === "error" ? "text-red-700" :
          check.status === "checking" ? "text-green-600" :
          "text-gray-500"
        }`}>
          {check.label}
        </p>
        {check.status === "error" && check.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-1"
          >
            <p className="text-red-600 text-sm">{check.error}</p>
            {check.hint && (
              <p className="text-red-500 text-xs mt-1 flex items-start gap-1">
                <span>💡</span> {check.hint}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Setup checks component
function SetupChecks({ checks }: { checks: SetupCheck[] }) {
  const allPassed = checks.every((c) => c.status === "success");
  const hasError = checks.some((c) => c.status === "error");

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-4 rounded-xl border ${
        allPassed
          ? "bg-green-50 border-green-200"
          : hasError
          ? "bg-red-50 border-red-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{allPassed ? "✅" : hasError ? "⚠️" : "⚙️"}</span>
        <span className={`font-semibold ${
          allPassed ? "text-green-800" : hasError ? "text-red-800" : "text-gray-700"
        }`}>
          {allPassed ? "All checks passed" : hasError ? "Setup incomplete" : "Checking setup..."}
        </span>
      </div>
      <div className="space-y-2">
        {checks.map((check) => (
          <CheckItem key={check.id} check={check} />
        ))}
      </div>
    </motion.div>
  );
}

// Error display component
function ErrorDisplay({ errors, type }: { errors: FormError[]; type: string }) {
  const bgColor = type === "validation" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  const textColor = type === "validation" ? "text-amber-800" : "text-red-800";
  const hintColor = type === "validation" ? "text-amber-600" : "text-red-600";
  const icon = type === "validation" ? "📝" : "⚠️";
  const title = type === "validation" ? "Please fix these issues:" : "Something went wrong:";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-4 ${bgColor} border rounded-xl mb-4 overflow-hidden`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className={`${textColor} font-semibold`}>{title}</span>
      </div>
      <ul className="space-y-2">
        {errors.map((error, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <p className={`${textColor} text-sm font-medium`}>{error.message}</p>
            <p className={`${hintColor} text-xs flex items-start gap-1`}>
              <span>💡</span> {error.hint}
            </p>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// Success message component
function SuccessMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-6 bg-green-50 border border-green-200 rounded-xl text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-8 h-8 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>
      <h3 className="text-green-800 font-bold text-xl mb-2">Message Sent!</h3>
      <p className="text-green-600">Thank you for reaching out. We'll get back to you soon.</p>
    </motion.div>
  );
}

// Input field component with animation
function FormField({
  label,
  name,
  type = "text",
  placeholder,
  as = "input",
  rows,
  hasError,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  as?: "input" | "textarea";
  rows?: number;
  hasError?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const Component = as;

  return (
    <motion.div variants={itemVariants}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <motion.div
        animate={{
          boxShadow: isFocused
            ? "0 0 0 3px rgba(34, 197, 94, 0.2)"
            : hasError
            ? "0 0 0 2px rgba(239, 68, 68, 0.3)"
            : "none",
        }}
        className="rounded-xl"
      >
        <Component
          type={type}
          name={name}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full border ${
            hasError ? "border-red-300" : "border-gray-200"
          } rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors bg-gray-50 focus:bg-white`}
          placeholder={placeholder}
        />
      </motion.div>
    </motion.div>
  );
}

// Get the reason why the button is disabled
function getDisabledReason(checks: SetupCheck[]): string | null {
  const envCheck = checks.find((c) => c.id === "env");
  const connectionCheck = checks.find((c) => c.id === "connection");
  const tableCheck = checks.find((c) => c.id === "table");

  if (envCheck?.status === "checking" || connectionCheck?.status === "checking" || tableCheck?.status === "checking") {
    return "Checking Supabase connection...";
  }

  if (envCheck?.status === "error") {
    return "Environment variables not configured";
  }

  if (connectionCheck?.status === "error") {
    return "Cannot connect to Supabase";
  }

  if (tableCheck?.status === "error") {
    return "Database table not ready";
  }

  if (envCheck?.status === "pending") {
    return "Waiting for setup checks...";
  }

  return null;
}

export default function Home() {
  const [checks, setChecks] = useState<SetupCheck[]>([
    { id: "env", label: "Environment variables configured", status: "pending" },
    { id: "connection", label: "Connected to Supabase", status: "pending" },
    { id: "table", label: "Contacts table accessible", status: "pending" },
  ]);
  const [submitState, setSubmitState] = useState<SubmitState>({ state: "idle" });
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  // Run setup checks on mount
  useEffect(() => {
    async function runChecks() {
      // Check 1: Environment variables
      setChecks((prev) =>
        prev.map((c) => (c.id === "env" ? { ...c, status: "checking" as CheckStatus } : c))
      );

      await new Promise((r) => setTimeout(r, 500)); // Small delay for visual feedback

      const configStatus = getConfigStatus();

      if (!configStatus.isConfigured) {
        setChecks((prev) =>
          prev.map((c) =>
            c.id === "env"
              ? {
                  ...c,
                  status: "error" as CheckStatus,
                  error: `Missing: ${configStatus.missingVars.join(", ")}`,
                  hint: configStatus.hints[0],
                }
              : c
          )
        );
        return;
      }

      setChecks((prev) =>
        prev.map((c) => (c.id === "env" ? { ...c, status: "success" as CheckStatus } : c))
      );

      // Check 2: Connection
      setChecks((prev) =>
        prev.map((c) => (c.id === "connection" ? { ...c, status: "checking" as CheckStatus } : c))
      );

      await new Promise((r) => setTimeout(r, 300));

      const connectionTest = await testConnection();

      if (!connectionTest.success) {
        // Determine if it's a connection or table issue
        const isTableIssue = connectionTest.error?.includes("Table") || connectionTest.error?.includes("relation");

        if (isTableIssue) {
          // Connection works but table doesn't exist
          setChecks((prev) =>
            prev.map((c) => {
              if (c.id === "connection") return { ...c, status: "success" as CheckStatus };
              if (c.id === "table") return {
                ...c,
                status: "error" as CheckStatus,
                error: connectionTest.error,
                hint: connectionTest.hint,
              };
              return c;
            })
          );
        } else {
          setChecks((prev) =>
            prev.map((c) =>
              c.id === "connection"
                ? {
                    ...c,
                    status: "error" as CheckStatus,
                    error: connectionTest.error,
                    hint: connectionTest.hint,
                  }
                : c
            )
          );
        }
        return;
      }

      setChecks((prev) =>
        prev.map((c) => (c.id === "connection" ? { ...c, status: "success" as CheckStatus } : c))
      );

      // Check 3: Table access
      setChecks((prev) =>
        prev.map((c) => (c.id === "table" ? { ...c, status: "checking" as CheckStatus } : c))
      );

      await new Promise((r) => setTimeout(r, 300));

      // If we got here, the table exists (testConnection checks it)
      setChecks((prev) =>
        prev.map((c) => (c.id === "table" ? { ...c, status: "success" as CheckStatus } : c))
      );
    }

    runChecks();
  }, []);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setSubmitState({ state: "error", errors: validationErrors, type: "validation" });
      return;
    }

    // Submit
    setSubmitState({ state: "submitting" });

    const result = await insertContact(formData);

    if (!result.success) {
      setSubmitState({
        state: "error",
        type: "database",
        errors: [
          {
            field: "database",
            message: result.error || "Failed to save",
            hint: result.hint || "Please try again later",
          },
        ],
      });
      return;
    }

    setSubmitState({ state: "success" });
    setFormData({ name: "", email: "", message: "" });
  }

  const errorFields = submitState.state === "error" ? submitState.errors.map((e) => e.field) : [];
  const isSubmitting = submitState.state === "submitting";
  const isReady = checks.every((c) => c.status === "success");
  const disabledReason = getDisabledReason(checks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-xl mx-auto p-8 pt-16"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200"
          >
            <span className="text-3xl">✉️</span>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Contact Us
          </h1>
          <p className="text-gray-500">We'd love to hear from you</p>
        </motion.div>

        {/* Setup Checks */}
        <motion.div variants={itemVariants}>
          <SetupChecks checks={checks} />
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-green-100/50 p-8 border border-green-100"
        >
          <AnimatePresence mode="wait">
            {submitState.state === "success" ? (
              <SuccessMessage key="success" />
            ) : (
              <motion.div key="form">
                {/* Error Display */}
                <AnimatePresence>
                  {submitState.state === "error" && (
                    <ErrorDisplay errors={submitState.errors} type={submitState.type} />
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5"
                  >
                    <FormField
                      label="Name"
                      name="name"
                      placeholder="Your name"
                      hasError={errorFields.includes("name")}
                      value={formData.name}
                      onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                    />
                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      hasError={errorFields.includes("email")}
                      value={formData.email}
                      onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
                    />
                    <FormField
                      label="Message"
                      name="message"
                      as="textarea"
                      rows={4}
                      placeholder="What would you like to tell us?"
                      hasError={errorFields.includes("message")}
                      value={formData.message}
                      onChange={(value) => setFormData((prev) => ({ ...prev, message: value }))}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <div>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !isReady}
                      variants={buttonVariants}
                      initial="idle"
                      whileHover={isReady ? "hover" : "idle"}
                      whileTap={isReady ? "tap" : "idle"}
                      className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all ${
                        !isReady
                          ? "bg-gray-300 cursor-not-allowed"
                          : isSubmitting
                          ? "bg-green-400"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200 hover:shadow-green-300"
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {isSubmitting ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-2"
                          >
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            Sending...
                          </motion.span>
                        ) : (
                          <motion.span
                            key="send"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            Send Message
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Disabled reason */}
                    <AnimatePresence>
                      {disabledReason && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-center text-gray-500 text-sm mt-2 flex items-center justify-center gap-1"
                        >
                          <span>🔒</span> {disabledReason}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset button after success */}
          <AnimatePresence>
            {submitState.state === "success" && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => setSubmitState({ state: "idle" })}
                className="mt-4 w-full py-2 text-green-600 hover:text-green-700 font-medium"
              >
                Send another message
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer hint */}
        <motion.p variants={itemVariants} className="text-center text-gray-400 text-sm mt-6">
          Built with React Router + Supabase
        </motion.p>
      </motion.div>
    </div>
  );
}
