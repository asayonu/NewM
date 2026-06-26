declare module "mahjong-tile-efficiency" {
  export type Hand = number[][];

  export const cal: {
    calShantenMenzu: (hand: Hand) => number;
    calShantenChiitoi: (hand: Hand) => number;
    calShantenKokushi: (hand: Hand) => number;
  };

  export class RuleSet {
    constructor(ruleName: "Riichi" | "Menzu" | "HK" | "ZungJung" | "MCR" | "Taiwan" | "HKTW");
    calShanten(hand: Hand): number;
    calUkeire(hand: Hand): {
      shanten: number;
      normalDiscard?: Record<string, Record<string, number>>;
      recedingDiscard?: Record<string, Record<string, number>>;
      ukeire?: Record<string, number>;
      totalUkeire?: number;
    };
  }

  export function tilesToHand(tiles: string[]): Hand;
}
