import { Link } from "react-router-dom";
import nameDarkTheme from "../../assets/name_dark-theme.svg";
import nameLightTheme from "../../assets/name_light-theme.svg";
import sound1 from "../../assets/sounds/sound1.mp3"
import sound2 from "../../assets/sounds/sound2.mp3"
import sound3 from "../../assets/sounds/sound3.mp3"
import icon1 from "../../assets/icon-1.svg";
import ThemeToggle from "../../utils/ThemeToggle";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
function LandingPage() {
  const sounds = [
    sound1,
    sound2,
    sound3,
  ];
  const isDark = useSelector((state: RootState) => state.theme);
  const playRandomSound = () => {
    const randomIndex = Math.floor(Math.random() * sounds.length);
    const audio = new Audio(sounds[randomIndex]);
    audio.currentTime = 0;
    audio.play();
  };

  return (
    <div className="w-full  overflow-hidden ">
      <div className="bg-primary relative">
        <div className="absolute right-2 top-2 ">
          <ThemeToggle />
        </div>
        <div
          className="h-full flex justify-center flex-col items-center w-screen gap-10 md:gap-0 "
          onClick={playRandomSound}
        >
          <div className="h-[90%] w-[90%] md:h-[30vh] md:w-[30vw]">
            <img
              src={isDark == "dark" ? nameDarkTheme : nameLightTheme}
              className="  h-full w-full object-contain"
            />
          </div>
          <div className="h-[90%] w-[90%] md:h-[30vh] md:w-[30vw] ">
            <img src={icon1} alt="" className="object-fill" />
          </div>
        </div>

        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className=""
          >
            <path
              fill="#0096c7"
              fillOpacity="1"
              d="M0,128L80,117.3C160,107,320,85,480,101.3C640,117,800,171,960,176C1120,181,1280,139,1360,117.3L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
          <div className="absolute inset-0 top-20 md:top-30 flex items-center justify-center text-wrap">
            <h2 className="text-white text-[22px] md:text-4xl font-semibold font-serif ">
              CONVERSE WITH ROYAL WIT
            </h2>
          </div>
        </div>
      </div>

      <div className="h-full w-full bg-secondary py-10 px-4 md:px-0">
        <div className="w-full flex flex-col md:flex-row justify-center items-center h-full gap-5">
          <Link to="/Signup">
            <button
              className=" px-5 py-4 bg-white rounded-2xl shadow
                 transition-all duration-200
                 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 "
            >
              Register Me Before I Change My Mind.
            </button>
          </Link>
          <Link to="/Login">
            <button
              className=" px-10 py-4 bg-white rounded-2xl shadow
                 transition-all duration-200
                 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1"
            >
              I Already Have an Account, Chill.
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
