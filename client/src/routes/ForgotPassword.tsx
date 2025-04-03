import { useState } from "react";
import axios from "axios";
import backgroundImage from "../images/agri-vector.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async () => {
    try {
      await axios.post("/api/v1/user/forgot-password", { email });
      setMessage("If this email is registered, a reset link has been sent.");
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen font-Arvo"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-Corp3 rounded-3xl pt-40 pb-40 p-36 shadow-xl shadow-Corp2">
        <div className="flex flex-col gap-5 p-10 bg-Corp2 rounded-2xl shadow-inner shadow-Corp1">
          <div className="flex flex-col items-center gap-3">
            <FontAwesomeIcon size="2xl" icon={faEnvelope} />
            <h1 className="text-3xl text-center">Forgot Password</h1>
          </div>
          
          <div className="flex flex-col items-center">
            <input
              id="email"
              placeholder="Enter your email"
              className="max-w-xs rounded-lg p-2 bg-slate-300 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="mt-4 text-center min-h-[1.5rem]">{message}</p>
          </div>

          <button
            onClick={handleSubmit}
            className="border border-solid rounded-xl p-1 hover:bg-Corp3 hover:border-Corp3"
          >
            Submit
          </button>
          <button
            className="border border-solid rounded-xl p-1 hover:bg-Corp3 hover:border-Corp3"
            onClick={() => (window.location.href = "/")}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
