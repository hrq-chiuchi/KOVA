import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";
import { groupMembers, judgeGroup, type LoadoutRules } from "../../../shared/loadout-rules";

type Line = CartValidationsGenerateRunInput["cart"]["lines"][number];

// Validation runs after the loadout-merge transform, so valid loadouts arrive as one merged
// "KOVA Loadout" line and any line still carrying a loadout group was rejected by the transform.
// Judging groups with the same shared rules (rather than trusting that absence of a merge means
// failure) keeps the messages specific and means a transform outage never blocks a valid loadout.
export function cartValidationsGenerateRun(input: CartValidationsGenerateRunInput): CartValidationsGenerateRunResult {
  const rules = input.validation.rules?.jsonValue as LoadoutRules | undefined;

  const groups = groupMembers<Line>(input.cart.lines.map((line) => {
    const variant = line.merchandise.__typename === "ProductVariant" ? line.merchandise : null;
    return {
      line,
      group: line.group?.value ?? null,
      quantity: line.quantity,
      slot: line.slot?.value ?? "",
      productId: variant?.product.id ?? "",
      title: variant?.product.title ?? "",
    };
  }));

  const errors: ValidationError[] = [];
  // The KOVA Loadout parent is published only so the transform can merge into it. A merged
  // loadout line costs its components' total; the parent added to a cart directly costs nothing.
  const parentAddedDirectly = input.cart.lines.some((line) =>
    line.merchandise.__typename === "ProductVariant" &&
    line.merchandise.id === rules?.parentVariantId &&
    Number(line.cost.totalAmount.amount) <= 0);
  if (parentAddedDirectly) {
    errors.push({ message: "A KOVA Loadout can only be built from its platform and modules.", target: "$.cart" });
  }

  for (const members of groups.values()) {
    const verdict = judgeGroup(members, rules);
    if (verdict.valid) continue;
    errors.push({
      message: verdict.platformTitle
        ? `The ${verdict.platformTitle} loadout is incomplete or has changed. Remove its items or rebuild the loadout.`
        : "A loadout in your bag is incomplete or has changed. Remove its items or rebuild the loadout.",
      target: "$.cart",
    });
  }

  return { operations: [{ validationAdd: { errors } }] };
}
