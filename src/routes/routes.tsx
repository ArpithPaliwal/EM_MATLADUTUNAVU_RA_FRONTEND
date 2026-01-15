import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import SignupPage from "../pages/LandingPage/SignupPage";
import LoginPage from "../pages/LandingPage/LoginPage";
import VerifyOtp from "../pages/LandingPage/VerifyOtp";
import Home from "../pages/Home/Home";
import DashBoard from "../pages/DashBoard/DashBoard";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verifyotp" element={<VerifyOtp />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/DashBoard" element={<DashBoard />} />
    </>
  )
);

export default router;
