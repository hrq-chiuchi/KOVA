import type {
  CartTransformRunInput,
  CartTransformRunResult,
  Operation,
} from "../generated/api";
import { groupMembers, judgeGroup, type LoadoutRules } from "../../../shared/loadout-rules";

type Line = CartTransformRunInput["cart"]["lines"][number];

const NO_CHANGES: CartTransformRunResult = {
  operations: [],
};

export function cartTransformRun(input: CartTransformRunInput): CartTransformRunResult {
  const rules = input.cartTransform.rules?.jsonValue as LoadoutRules | undefined;
  if (!rules?.parentVariantId) return NO_CHANGES;

  const groups = groupMembers<Line>(input.cart.lines.flatMap((line) => {
    if (line.merchandise.__typename !== "ProductVariant") return [];
    return [{
      line,
      group: line.group?.value ?? null,
      quantity: line.quantity,
      slot: line.slot?.value ?? "",
      productId: line.merchandise.product.id,
      title: line.merchandise.product.title,
    }];
  }));

  const operations: Operation[] = [];
  for (const members of groups.values()) {
    const verdict = judgeGroup(members, rules);
    if (!verdict.valid) continue;
    operations.push({
      linesMerge: {
        parentVariantId: rules.parentVariantId,
        title: `Loadout — ${verdict.platform.title}`,
        // Lets the theme tell a merged loadout from a native bundle without reading product data.
        attributes: [{ key: "_kova_loadout_platform", value: verdict.platform.title }],
        cartLines: members.map((member) => ({ cartLineId: member.line.id, quantity: member.quantity })),
        ...(verdict.percent > 0 ? { price: { percentageDecrease: { value: verdict.percent } } } : {}),
      },
    });
  }
  return { operations };
}
