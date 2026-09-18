import { create } from 'zustand';

interface CompareState {
  selectedBrokerIds: string[];
  addBroker: (id: string) => boolean;
  removeBroker: (id: string) => void;
  toggleBroker: (id: string) => void;
  clearBrokers: () => void;
  isSelected: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  selectedBrokerIds: [],

  addBroker: (id: string) => {
    const { selectedBrokerIds } = get();
    if (selectedBrokerIds.includes(id)) return false;
    if (selectedBrokerIds.length >= 4) return false;
    set({ selectedBrokerIds: [...selectedBrokerIds, id] });
    return true;
  },

  removeBroker: (id: string) => {
    set({
      selectedBrokerIds: get().selectedBrokerIds.filter((item) => item !== id),
    });
  },

  toggleBroker: (id: string) => {
    const { selectedBrokerIds, addBroker, removeBroker } = get();
    if (selectedBrokerIds.includes(id)) {
      removeBroker(id);
    } else {
      addBroker(id);
    }
  },

  clearBrokers: () => {
    set({ selectedBrokerIds: [] });
  },

  isSelected: (id: string) => {
    return get().selectedBrokerIds.includes(id);
  },
}));
