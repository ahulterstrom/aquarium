interface EventStore {
  // Current event
  currentEvent: GameEvent | null;
  currentNode: EventNode | null;

  // Event state
  eventHistory: Record<string, string[]>; // eventId -> choices made
  availableChoices: EventChoice[];

  // Actions
  startEvent: (eventId: string) => void;
  makeChoice: (choiceIndex: number) => void;
  completeEvent: () => void;
}
