import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";

// The loadout-merge transform runs first and merges every valid loadout into one parent line.
// A line that still carries a loadout group and has no parent was rejected by the transform,
// so it would otherwise check out at full price outside its loadout.
export function cartValidationsGenerateRun(input: CartValidationsGenerateRunInput): CartValidationsGenerateRunResult {
  const unmerged = new Map<string, string>();
  for (const line of input.cart.lines) {
    const group = line.group?.value;
    if (!group || line.parentRelationship) continue;
    if (!unmerged.has(group)) unmerged.set(group, "");
    if (line.slot?.value === "platform" && line.merchandise.__typename === "ProductVariant") {
      unmerged.set(group, line.merchandise.product.title);
    }
  }

  const errors: ValidationError[] = [...unmerged.values()].map((platform) => ({
    message: platform
      ? `The ${platform} loadout is incomplete or has changed. Remove its items or rebuild the loadout.`
      : "A loadout in your bag is incomplete or has changed. Remove its items or rebuild the loadout.",
    target: "$.cart",
  }));

  return { operations: [{ validationAdd: { errors } }] };
}
