import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  currentLocation: 'overworld',
  isTransitioning: false,
  isEditor: false,
  alwaysDay: false,
  alwaysClear: false,
  loadingComplete: false,
  contactModalOpen: false,
  
  setContactModalOpen: (val) => set({ contactModalOpen: val }),
  setLoadingComplete: (val) => set({ loadingComplete: val }),
  toggleEditor: () => set(state => ({ isEditor: !state.isEditor })),
  toggleAlwaysDay: () => set(state => ({ alwaysDay: !state.alwaysDay })),
  toggleAlwaysClear: () => set(state => ({ alwaysClear: !state.alwaysClear })),
  
  teleportTo: (location) => {
    const { currentLocation, isTransitioning } = get();
    if (location === currentLocation || isTransitioning) return;
    try {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } catch (e) {}
    set({ isTransitioning: true });
    setTimeout(() => {
      set({ currentLocation: location });
      setTimeout(() => {
         set({ isTransitioning: false });
      }, 500);
    }, 500);
  }
}));

export default useGameStore;
