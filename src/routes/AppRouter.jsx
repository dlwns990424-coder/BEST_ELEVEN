import { Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import MakeTeam from "../pages/makeTeam/MakeTeam";
import MyTeam from "../pages/myTeam/MyTeam";
import SignUp from "../pages/signUp/SignUp";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<SignUp />} />

      {/* 새 팀 생성 */}
      <Route path="/make-team" element={<MakeTeam />} />

      {/* 저장된 팀 수정 */}
      <Route path="/make-team/:teamId" element={<MakeTeam />} />

      <Route path="/my-team" element={<MyTeam />} />
    </Routes>
  );
}
