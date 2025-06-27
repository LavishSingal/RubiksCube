import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Test from "./pages/Test";
import Home from "./pages/Home";
import PuzzlePage from "./pages/Practice";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/test" element={<Test />} /> */}
        <Route path="/puzzle" element={<PuzzlePage />} />
      </Routes>
    </Router>
  );
}

export default App;
