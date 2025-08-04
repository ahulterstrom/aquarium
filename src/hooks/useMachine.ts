import { useMachine as useXStateMachine } from '@xstate/react';
import { useEffect } from 'react';
import { AnyStateMachine } from 'xstate';

export function useMachine<TMachine extends AnyStateMachine>(
  machine: TMachine,
  options?: Parameters<typeof useXStateMachine>[1]
) {
  const [state, send, service] = useXStateMachine(machine, options);
  
  // Log state transitions in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      const subscription = service.subscribe((state) => {
        console.log(`[${machine.id}] State:`, state.value);
        console.log(`[${machine.id}] Context:`, state.context);
      });
      
      return () => subscription.unsubscribe();
    }
  }, [service, machine.id]);
  
  return {
    state,
    send,
    service,
    isInState: (stateValue: string) => state.matches(stateValue),
    context: state.context,
  };
}