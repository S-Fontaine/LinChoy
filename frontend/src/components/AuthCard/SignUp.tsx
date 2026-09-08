"use client";
import { eyeOff, eyeOn } from "../icons/Icons";
import { useState } from "react";
import { checkPasswordStrength } from "@/lib/passwordRules";
import PasswordRulesList from "../ui/PasswordRulesList";

const inputClass =
  "w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-[0.95rem] text-text-high outline-none transition-all duration-300 ease-smooth focus:border-lin-orange focus:shadow-[0_0_0_2px_var(--lin-orange-glow)]";
const passwordInputClass = `${inputClass} pr-11.25`;
const confirmInputBaseClass =
  "w-full rounded-lg border bg-bg-input px-4 py-3 pr-11.25 text-[0.95rem] text-text-high outline-none transition-all duration-300 ease-smooth focus:border-lin-orange focus:shadow-[0_0_0_2px_var(--lin-orange-glow)]";
const labelClass = "text-[0.85rem] font-medium text-text-high";
const btnClass =
  "cursor-pointer rounded-lg border border-border bg-bg-surface px-7 py-3.5 text-[0.95rem] font-semibold text-text-high transition-all duration-300 ease-smooth";
const eyeButtonClass =
  "absolute top-1/2 right-5 z-[2] flex -translate-y-1/2 items-center rounded-full border-0 bg-transparent p-0 text-text-medium cursor-pointer";

interface IFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
interface IApiResponse {
  loading: boolean;
  error: string;
  success: string;
}

interface ISignUp {
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: IFormData;
  apiResponse: IApiResponse;
}

export default function SignUp({
  handleSubmit,
  handleInputChange,
  formData,
  apiResponse,
}: ISignUp) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isComplete: isPasswordValid } = checkPasswordStrength(
    formData.password,
  );

  const passwordsMatch =
    formData.confirmPassword.length === 0 ||
    formData.confirmPassword === formData.password;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" key="form-register">
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="signup-nickname">
          Nom d&apos;utilisateur
        </label>
        <input
          type="text"
          name="username"
          id="signup-nickname"
          required
          placeholder="JosephLeGourmand"
          autoComplete="off"
          className={inputClass}
          value={formData.username}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="signup-email">
          Adresse Email
        </label>
        <input
          type="email"
          name="email"
          id="signup-email"
          required
          placeholder="josephlegourmand@exemple.com"
          autoComplete="username"
          className={inputClass}
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="signup-password">
          Mot de passe
        </label>
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="signup-password"
            required
            autoComplete="new-password"
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
            {showPassword ? eyeOff : eyeOn}
          </button>
        </div>

        {formData.password.length > 0 && (
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-250 ease-[ease]">
            <PasswordRulesList
              password={formData.password}
              showStrengthBar={true}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="signup-confirm-password">
          Confirmer le mot de passe
        </label>
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            id="signup-confirm-password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`${confirmInputBaseClass} ${
              !passwordsMatch ? "border-lin-orange" : "border-border"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={eyeButtonClass}
            aria-label="Afficher ou masquer le mot de passe de confirmation"
          >
            {showConfirmPassword ? eyeOff : eyeOn}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={apiResponse.loading || !isPasswordValid || !passwordsMatch}
        className={btnClass}
      >
        {apiResponse.loading ? "Patientez..." : "S'inscrire"}
      </button>
    </form>
  );
}
