export type AccountMode = "signup" | "login" | "forgot" | "reset";
export interface AccountValues {
  name: string;
  email: string;
  password: string;
  confirmation: string;
}
export type LoginInput = Pick<AccountValues, "email" | "password">;
export type ResetInput = Pick<AccountValues, "password" | "confirmation">;
export type SignupInput = AccountValues;
export interface AccountInputByMode {
  signup: SignupInput;
  login: LoginInput;
  forgot: Pick<AccountValues, "email">;
  reset: ResetInput;
}
export type AccountErrors = Partial<Record<keyof AccountValues, string>>;
export const passwordChecks = (value: string) => ({
  length: Array.from(value).length >= 12 && Array.from(value).length <= 128,
  letter: /\p{L}/u.test(value),
  number: /\d/.test(value),
});
export function validateAccount<M extends AccountMode>(
  mode: M,
  values: AccountInputByMode[M],
): AccountErrors {
  const errors: AccountErrors = {};
  if (
    mode === "signup" &&
    "name" in values &&
    (values.name.trim().length < 2 || values.name.trim().length > 100)
  )
    errors.name = "Enter your name (2–100 characters).";
  if (
    mode !== "reset" &&
    "email" in values &&
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) ||
      values.email.length > 254)
  )
    errors.email = "Enter a valid email address.";
  if (mode === "login" && "password" in values && !values.password)
    errors.password = "Enter your password.";
  if (
    (mode === "signup" || mode === "reset") &&
    "password" in values &&
    "confirmation" in values
  ) {
    const checks = passwordChecks(values.password);
    if (!Object.values(checks).every(Boolean))
      errors.password = "Use 12–128 characters with a letter and a number.";
    if (values.confirmation !== values.password || !values.confirmation)
      errors.confirmation = "The passwords must match.";
  }
  return errors;
}
