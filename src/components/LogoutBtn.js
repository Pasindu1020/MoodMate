import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function LogoutBtn() {
  const navigate = useNavigate();
  return (
    <button
      onClick={async () => {
        await signOut(auth);
        navigate("/login");
      }}
      className="ml-4 px-3 py-2 rounded bg-neon-coral text-white"
    >
      Log out
    </button>
  );
}
