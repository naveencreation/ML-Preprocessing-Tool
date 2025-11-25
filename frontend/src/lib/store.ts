import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
    sidebarCollapsed: boolean
    toggleSidebar: () => void
    currentDataset: number | null
    setCurrentDataset: (id: number | null) => void
    defaultPreprocessingOptions: {
        missing_option: string
        encoding_method: string
        scaling_method: string
    }
    setDefaultPreprocessingOptions: (options: {
        missing_option: string
        encoding_method: string
        scaling_method: string
    }) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            currentDataset: null,
            setCurrentDataset: (id) => set({ currentDataset: id }),
            defaultPreprocessingOptions: {
                missing_option: "Fill with Mean",
                encoding_method: "Label Encoding",
                scaling_method: "StandardScaler"
            },
            setDefaultPreprocessingOptions: (options) => set({ defaultPreprocessingOptions: options })
        }),
        {
            name: "ml-preprocessing-storage"
        }
    )
)
