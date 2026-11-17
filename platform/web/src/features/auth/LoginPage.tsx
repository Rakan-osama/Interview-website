import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiRequest, ensureCsrfCookie } from "../../shared/api/client";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const login = useMutation({
    mutationFn: async (form: LoginForm) => {
      await ensureCsrfCookie();
      return apiRequest("/auth/login", { method: "POST", body: JSON.stringify(form) });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      const destination = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(destination, { replace: true });
    },
  });
  const submit = handleSubmit((form) => {
    const parsed = schema.safeParse(form);
    if (parsed.success) login.mutate(parsed.data);
  });
  return (
    <main className="page">
      <form className="card form-card" onSubmit={submit}>
        <h1>تسجيل الدخول</h1>
        <label className="form-field">البريد الإلكتروني<input type="email" autoComplete="email" {...register("email")} />{errors.email && <span className="error">اكتب بريدًا صحيحًا.</span>}</label>
        <label className="form-field">كلمة المرور<input type="password" autoComplete="current-password" {...register("password")} />{errors.password && <span className="error">ثمانية أحرف على الأقل.</span>}</label>
        {login.isError && <p className="error">بيانات الدخول غير صحيحة.</p>}
        <button className="button" disabled={login.isPending}>دخول</button>
        <p>ليس لديك حساب؟ <Link className="text-link" to="/register">أنشئ حساب متعلّم جديد</Link></p>
      </form>
    </main>
  );
}
