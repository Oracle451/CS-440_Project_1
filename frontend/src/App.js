// Import the style sheet
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Import the various jsx files
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import EditPost from "./pages/EditPost";

// Create the app function
function App() {
  // Make each of the routes fpr the various pages
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;
