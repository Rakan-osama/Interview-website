import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiRequest, ensureCsrfCookie } from "../../shared/api/client";

const schema = z.object({
  name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(8), password_confirmation: z.string(),
}).refine((value) => value.password === value.password_confirmation, { path: ["password_confirmation"] });
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
  });
  const submit = form.handleSubmit((values) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) registration.mutate(parsed.data);
  });
  return <main className="page"><form className="card form-card" onSubmit={submit}>
    <h1>Create your learner account</h1>
    <label className="form-field">Name<input autoComplete="name" {...form.register("name")} /></label>
    <label className="form-field">Email<input type="email" autoComplete="email" {...form.register("email")} /></label>
    <label className="form-field">Password<input type="password" autoComplete="new-password" {...form.register("password")} /></label>
    <label className="form-field">Confirm password<input type="password" autoComplete="new-password" {...form.register("password_confirmation")} /></label>
    {Object.keys(form.formState.errors).length > 0 && <p className="error">Check the account details.</p>}
    {registration.isError && <p className="error">The account could not be created.</p>}
    <button className="button" disabled={registration.isPending}>{registration.isPending ? "Creating…" : "Create account"}</button>
    <p>Already registered? <Link to="/login">Sign in</Link>.</p>
  </form></main>;
}
