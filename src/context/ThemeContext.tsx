import {
  createContext,
  useContext,
  useEffect,
  useState
}
from "react";

interface ThemeContextType
{
  darkMode:boolean;

  toggleTheme:()=>void;
}

const ThemeContext =
createContext<ThemeContextType>(
  {} as ThemeContextType
);

export const ThemeProvider =
({
  children
}:{
  children:React.ReactNode
}) =>
{
  const [darkMode,
    setDarkMode]
    = useState(false);

  useEffect(() =>
  {
    const savedTheme =
      localStorage.getItem(
        "trackwise-theme"
      );

    if(savedTheme === "dark")
    {
      setDarkMode(true);

      document.body.classList.add(
        "dark-theme"
      );
    }
  }, []);

  const toggleTheme =
    () =>
  {
    const newMode =
      !darkMode;

    setDarkMode(
      newMode
    );

    if(newMode)
    {
      document.body.classList.add(
        "dark-theme"
      );

      localStorage.setItem(
        "trackwise-theme",
        "dark"
      );
    }
    else
    {
      document.body.classList.remove(
        "dark-theme"
      );

      localStorage.setItem(
        "trackwise-theme",
        "light"
      );
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme =
() =>
useContext(
  ThemeContext
);