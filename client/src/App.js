import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

// COMPONENTS
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/chats" element={<ChatPage />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;