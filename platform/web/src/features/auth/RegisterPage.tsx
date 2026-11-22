import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiErrorMessage, apiRequest, ensureCsrfCookie, validationErrors } from "../../shared/api/client";

const schema = z.object({
  name: z.string().min(2, "Enter at least 2 characters.").max(100, "The name is too long."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "The password must contain at least 8 characters."),
  password_confirmation: z.string().min(1, "Confirm your password."),
}).refine((value) => value.password === value.password_confirmation, { path: ["password_confirmation"], message: "The password confirmation does not match." });
type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<RegisterForm>();
  const registration = useMutation({
    mutationFn: async (values: RegisterForm) => {
      await ensureCsrfCookie();
      return apiRequest("/auth/register", { method: "POST", body: JSON.stringify(values) });
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["current-user"] }); navigate("/dashboard"); },
    onError: (error) => {
      for (const [field, messages] of Object.entries(validationErrors(error))) {
        if (["name", "email", "password", "password_confirmation"].includes(field)) form.setError(field as keyof RegisterForm, { type: "server", message: messages[0] });
      }
    },
  });
  const submit = form.handleSubmit((values) => {
    form.clearErrors();
    const parsed = schema.safeParse(values);
    if (parsed.success) return registration.mutate(parsed.data);
    for (const issue of parsed.error.issues) form.setError(issue.path[0] as keyof RegisterForm, { type: "client", message: issue.message });
  });

  return <main className="page"><form className="card form-card" onSubmit={submit}>
    <h1>Create a learner account</h1>
    <label className="form-field">Name<input autoComplete="name" dir="auto" {...form.register("name")} />{form.formState.errors.name && <span className="error">{form.formState.errors.name.message}</span>}</label>
    <label className="form-field">Email<input type="email" autoComplete="email" {...form.register("email")} />{form.formState.errors.email && <span className="error">{form.formState.errors.email.message}</span>}</label>
    <label className="form-field">Password<input type="password" autoComplete="new-password" {...form.register("password")} />{form.formState.errors.password && <span className="error">{form.formState.errors.password.message}</span>}</label>
    <label className="form-field">Confirm password<input type="password" autoComplete="new-password" {...form.register("password_confirmation")} />{form.formState.errors.password_confirmation && <span className="error">{form.formState.errors.password_confirmation.message}</span>}</label>
    {registration.isError && Object.keys(validationErrors(registration.error)).length === 0 && <p className="error" role="alert">{apiErrorMessage(registration.error, "Account creation failed. Try again.")}</p>}
    <button className="button" disabled={registration.isPending}>{registration.isPending ? "Creating account…" : "Create account"}</button>
    <p>Already have an account? <Link className="text-link" to="/login">Sign in</Link>.</p>
  </form></main>;
}
