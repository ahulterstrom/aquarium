interface RestSiteStore {
  // Rest options
  canRest: boolean;
  canSmith: boolean;
  canDig: boolean; // with shovel
  canLift: boolean; // with girya

  // Special rest site events
  dreamAvailable: boolean;

  // Actions
  rest: () => void;
  smith: () => void;
  dig: () => void;
  lift: () => void;
  dream: (cardToUpgrade: number) => void;
}
