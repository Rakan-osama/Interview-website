import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiErrorMessage, apiRequest, ensureCsrfCookie, validationErrors } from "../../shared/api/client";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "The password must contain at least 8 characters."),
});
type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const form = useForm<LoginForm>();
  const login = useMutation({
    mutationFn: async (values: LoginForm) => {
      await ensureCsrfCookie();
      return apiRequest("/auth/login", { method: "POST", body: JSON.stringify(values) });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      navigate((location.state as { from?: string } | null)?.from ?? "/dashboard", { replace: true });
    },
    onError: (error) => {
      const errors = validationErrors(error);
      if (errors.email?.[0]) form.setError("email", { type: "server", message: errors.email[0] });
      if (errors.password?.[0]) form.setError("password", { type: "server", message: errors.password[0] });
    },
  });
  const submit = form.handleSubmit((values) => {
    form.clearErrors();
    const parsed = schema.safeParse(values);
    if (parsed.success) login.mutate(parsed.data);
    else for (const issue of parsed.error.issues) form.setError(issue.path[0] as keyof LoginForm, { type: "client", message: issue.message });
  });

  return <main className="page"><form className="card form-card" onSubmit={submit}>
    <h1>Sign in</h1>
    <label className="form-field">Email<input type="email" autoComplete="email" {...form.register("email")} />{form.formState.errors.email && <span className="error">{form.formState.errors.email.message}</span>}</label>
    <label className="form-field">Password<input type="password" autoComplete="current-password" {...form.register("password")} />{form.formState.errors.password && <span className="error">{form.formState.errors.password.message}</span>}</label>
    {login.isError && Object.keys(validationErrors(login.error)).length === 0 && <p className="error" role="alert">{apiErrorMessage(login.error, "Sign in failed. Check your credentials and try again.")}</p>}
    <button className="button" disabled={login.isPending}>{login.isPending ? "Signing in…" : "Sign in"}</button>
    <p>New to Backend Lab? <Link className="text-link" to="/register">Create a learner account</Link>.</p>
  </form></main>;
}
