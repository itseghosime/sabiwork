/** Stable progress key for a lesson title; it is stored with each learner's account. */
export function trainingSectionId(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-NG")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
