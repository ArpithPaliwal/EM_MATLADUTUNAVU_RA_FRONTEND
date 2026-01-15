
import { Sun } from "../assets/icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/themeSlice";
import type { RootState } from "../store/store";


function ThemeToggle() {
  const theme = useSelector((state: RootState) => state.theme);
const dispatch = useDispatch();

  return (
    <button
      className="md:flex bg-bg-small rounded-full p-2 h-fit w-fit border-2 border-primary"
      onClick={() => dispatch(toggleTheme())}
    >
      <Sun color={theme === "light" ? "gray" : "white"} size={20} />

    </button>
  );
}

export default ThemeToggle;
