import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  activeModal: string | null;
  modalData: Record<string, any>;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning' | null;
    isOpen: boolean;
  };
}

const initialState: UIState = {
  isSidebarOpen: true,
  isDarkMode: false,
  activeModal: null,
  modalData: {},
  toast: {
    message: '',
    type: null,
    isOpen: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    openModal: (state, action: PayloadAction<{ modalId: string | null; data?: any }>) => {
      state.activeModal = action.payload.modalId;
      if (action.payload.modalId && action.payload.data) {
        state.modalData[action.payload.modalId] = action.payload.data;
      }
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    clearModalData: (state, action: PayloadAction<string>) => {
      delete state.modalData[action.payload];
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type,
        isOpen: true,
      };
    },
    hideToast: (state) => {
      state.toast = {
        message: '',
        type: null,
        isOpen: false,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  openModal,
  closeModal,
  clearModalData,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;