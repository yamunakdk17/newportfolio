import { createContext, useContext } from "react";

export const ConfigContext = createContext(null);
export const useCfg = () => useContext(ConfigContext);
export const secOn = (cfg, id) => cfg.sections.some((s) => s.id === id && s.on);
