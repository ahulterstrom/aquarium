import { Card } from "@/lib/types";

interface DeckStore {
  // Deck management
  masterDeck: Card[]; // All cards owned
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  exhaustPile: Card[];

  // Card limits
  maxHandSize: number;
  cardDrawPerTurn: number;

  // Actions - Deck Building
  addCardToDeck: (card: Card) => void;
  removeCardFromDeck: (cardIndex: number) => void;
  upgradeCard: (cardIndex: number) => void;
  transformCard: (cardIndex: number, newCard: Card) => void;

  // Actions - Combat
  drawCards: (amount: number) => Card[];
  playCard: (handIndex: number, targetId?: string) => void;
  discardCard: (handIndex: number) => void;
  exhaustCard: (card: Card) => void;
  shuffleDeck: () => void;

  // Special mechanics
  addCardToHand: (card: Card) => void;
  addCardToDrawPile: (
    card: Card,
    position: "top" | "bottom" | "random",
  ) => void;
  addCardToDiscardPile: (card: Card) => void;

  // Queries
  getPlayableCards: (energy: number) => number[];
  hasCardInDeck: (cardId: string) => boolean;
}
