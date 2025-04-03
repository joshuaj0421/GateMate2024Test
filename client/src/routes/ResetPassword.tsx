import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../images/agri-vector.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    try {
      const response = await axios.post("/api/v1/user/reset-password", { token, newPassword });

      setMessage(response.data.message);

      // Redirect to login page after a delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setMessage(error.response?.data.message || "An error occurred. Please try again later.");
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
            <FontAwesomeIcon size="2xl" icon={faLock} />
            <h1 className="text-3xl text-center">Reset Password</h1>
          </div>
          <input
            type="password"
            id="newPassword"
            placeholder="Enter new password"
            className="max-w-xs rounded-lg p-2 bg-slate-300 text-black"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            className="max-w-xs rounded-lg p-2 bg-slate-300 text-black"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {message && <p className="text-center">{message}</p>}
          <button
            onClick={handleSubmit}
            className="border border-solid rounded-xl p-1 hover:bg-Corp3 hover:border-Corp3"
          >
            Submit
          </button>
          <button
            className="border border-solid rounded-xl p-1 hover:bg-Corp3 hover:border-Corp3"
            onClick={() => navigate("/")}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
