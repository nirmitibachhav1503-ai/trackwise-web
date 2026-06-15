import {
  Button
}
from "@mui/material";

import {
  useTheme
}
from "../context/ThemeContext";

function ThemeToggle()
{
  const {
    darkMode,
    toggleTheme
  } = useTheme();

  return (

    <Button
      variant="outlined"
      onClick={
        toggleTheme
      }
    >

      {
        darkMode
        ?
        "☀ Light Mode"
        :
        "🌙 Dark Mode"
      }

    </Button>

  );
}

export default ThemeToggle;