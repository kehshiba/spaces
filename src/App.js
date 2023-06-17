import './App.css';
import Attendance from "./pages/attendance";
import Login from "./pages/login";
import {Route, Routes} from "react-router-dom";
import AddNew from "./pages/addnew";
import ViewAll from "./pages/viewall";
import Reset from "./pages/reset";
import Profile from "./pages/Profile";
import ProfileBuilder from "./pages/profilebuilder";
import Lost from "./pages/lost";

function App() {

  return (
    <div className="App">
            <Routes>
                <Route exact path="/login" element={<Login />} />
                <Route exact path="/add" element={<AddNew />} />
                <Route exact path="/view" element={<ViewAll />} />
                <Route exact path="/" element={<Attendance />} />
                <Route exact path="/reset" element={<Reset />} />
                <Route exact path="/reset" element={<Reset />} />
                <Route exact path="/lost" element={<Lost />} />
                <Route path="/me/:username" element={<Profile />} />
                <Route path="/spaces" element={<ProfileBuilder />} />
            </Routes>
     </div>


)}

export default App;
