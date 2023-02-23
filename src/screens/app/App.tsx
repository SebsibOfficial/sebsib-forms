import {
  Link,
  Outlet,
  Route,
  Routes,
  useOutletContext,
} from "react-router-dom";
import "./App.css";
import axios from "axios";
import CryptoJS from "crypto-es";
import Landing from "../Landing/Landing";

function App() {

  const header = JSON.stringify({
    PLATFORM_ID: "SEBSIB_FORMS_1",
    JWT:'',
  });

  const key = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_PRIVATE_KEY);
  const iv = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_IV);

  var cipher = CryptoJS.AES.encrypt(header, key, {
    iv: iv,
    mode: CryptoJS.mode.CTR,
  });

  axios.defaults.headers.common["Authorization"] = cipher as any;

  return (
    <div className="parent-screen">
      <Routes>
        <Route path="/" element={<div> <Outlet /> </div>}>
          <Route index element={<Landing />} />
          <Route path=":link" element={<Landing />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
