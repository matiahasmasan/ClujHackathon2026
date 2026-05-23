import { useState } from "react";
import { useAuthForm } from "@/lib/use-auth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function BetterAuthLogin() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthForm();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Sign In"}
        </Button>
      </form>

      <div className="my-4 border-t">
        <p className="text-center text-gray-600 text-sm py-2">Or continue with</p>
        <Button variant="outline" className="w-full">
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          Google
        </Button>
      </div>
    </div>
  );
}
