import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  currentLocation: 'overworld',
  isTransitioning: false,
  isEditor: false,
  alwaysDay: false,
  alwaysClear: false,
  
  toggleEditor: () => set(state => ({ isEditor: !state.isEditor })),
  toggleAlwaysDay: () => set(state => ({ alwaysDay: !state.alwaysDay })),
  toggleAlwaysClear: () => set(state => ({ alwaysClear: !state.alwaysClear })),
  
  teleportTo: (location) => {
    const { currentLocation, isTransitioning } = get();
    
    // Don't transition if already there or already transitioning
    if (location === currentLocation || isTransitioning) return;

    // Start transition (triggers the screen-space flash/dissolve shader)
    set({ isTransitioning: true });

    // Wait 500ms (duration of the fade in) before swapping the underlying scene
    setTimeout(() => {
      set({ currentLocation: location });
      
      // Wait another 500ms (duration of the fade out) before marking transition complete
      setTimeout(() => {
         set({ isTransitioning: false });
      }, 500);
    }, 500);
  }
}));

export default useGameStore;
