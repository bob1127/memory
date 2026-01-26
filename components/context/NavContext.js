// components/context/NavContext.js
import { createContext, useContext, useState } from "react";

const NavContext = createContext({
  customSwitchLink: null,
  setCustomSwitchLink: () => {},
});

export const NavProvider = ({ children }) => {
  const [customSwitchLink, setCustomSwitchLink] = useState(null);

  return (
    <NavContext.Provider value={{ customSwitchLink, setCustomSwitchLink }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);