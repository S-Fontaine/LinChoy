"use client";
import { eyeOff, eyeOn } from "../icons/Icons";
import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-[0.95rem] text-text-high outline-none transition-all duration-300 ease-smooth focus:border-lin-orange focus:shadow-[0_0_0_2px_var(--lin-orange-glow)]";
const passwordInputClass = `${inputClass} pr-11.25`;
const labelClass = "text-[0.85rem] font-medium text-text-high";
const btnClass =
  "cursor-pointer rounded-lg border border-border bg-bg-surface px-7 py-3.5 text-[0.95rem] font-semibold text-text-high transition-all duration-300 ease-smooth";
const eyeButtonClass =
  "absolute top-1/2 right-5 z-[2] flex -translate-y-1/2 items-center rounded-full border-0 bg-transparent p-0 text-text-medium cursor-pointer";

interface IFormData {
  email: string;
  password: string;
}
interface IApiResponse {
  loading: boolean;
  error: string;
  success: string;
}

interface ISignIn {
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: IFormData;
  apiResponse: IApiResponse;
  onForgotPassword: () => void;
}

export default function SignIn({
  handleSubmit,
  handleInputChange,
  formData,
  apiResponse,
  onForgotPassword,
}: ISignIn) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" key="form-login">
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="login-username">
          Adresse Email
        </label>
        <input
          type="text"
          inputMode="email"
          name="email"
          id="login-username"
          required
          placeholder="JosephLeGourmand@exemple.com"
          autoComplete="username"
          className={inputClass}
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <label className={labelClass} htmlFor="login-password">
            Mot de passe
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="cursor-pointer border-0 bg-transparent text-[0.8rem] text-text-low underline hover:text-choy-green"
          >
            Mot de passe oublié ?
          </button>
        </div>
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="login-password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={passwordInputClass}
            value={formData.password}
            onChange={handleInputChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={eyeButtonClass}
            aria-label="Afficher ou masquer le mot de passe"
          >
            {showPassword ? eyeOff : eyeOn}{" "}
          </button>
        </div>
      </div>

      <button type="submit" disabled={apiResponse.loading} className={btnClass}>
        {apiResponse.loading ? "Patientez..." : "Se connecter"}
      </button>
    </form>
  );
}
