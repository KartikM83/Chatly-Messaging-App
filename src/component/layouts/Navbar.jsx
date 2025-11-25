import { FiMessageCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-heading font-bold text-xl">
            <FiMessageCircle />
          </div>
          <span className="text-xl font-heading font-bold ">Chatly Web</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            className="h-10 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
          <button className="gradient-primary rounded-md h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Try Demo
          </button>
        </div>
      </div>
    </header>
  );
}


