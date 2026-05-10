import React, { createContext, useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { PALETTES } from "./palettes";
import { calculateDominance } from "../utils/calcSupportDominance";
import { selectDailyShade } from "../utils/selectDailyShade";

export const ThemeContext = createContext(null);

export default function AdaptiveThemeProvider({ children }) {
    const { user } = useAuth();
    const [palette, setPalette] = useState(PALETTES.neutral[0]);
    const [adaptiveEnabled, setAdaptiveEnabled] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function loadTheme() {
            const snap = await getDoc(doc(db, "support_usage", user.uid));
            const supports = snap.data()?.supports || [];
            //const { type, confidence } = calculateDominance(supports);
            const type = "depression";
            const confidence = 1;
            const shades = PALETTES[type] || PALETTES.neutral;
            const selected = shades[0];
            //const selected = shades[1] || shades[0];
            //const selected = adaptiveEnabled ? shades[1] || shades[0] : shades[0];
            //const selected = selectDailyShade(shades, confidence);
            setPalette(selected);
        }

        loadTheme();
    }, [user]);

    const finalPalette = adaptiveEnabled ? palette : PALETTES.neutral[0];

    return (
        <ThemeContext.Provider
            value={{
                ...finalPalette,
                adaptiveEnabled,
                setAdaptiveEnabled
            }}
        >
            <div
                style={{
                    backgroundColor: finalPalette.bg,
                    color: finalPalette.text,
                    minHeight: "100vh",
                    transition: "background-color 2.5s ease, color 2.5s ease"
                }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    );
}
