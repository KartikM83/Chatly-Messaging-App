import { FiZap } from "react-icons/fi";
import { MdOutlineShield } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
export default function Section() {
  return (
    <section className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Modern Messaging
            <br />
            for Everyone
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Fast, secure, and beautiful messaging. Connect with friends and
            family instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="gradient-primary rounded-md h-11 rounded-md px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Try Demo Now
            </button>
            <button className="h-11 rounded-md px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
              Create Account
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 rounded-2xl bg-card shadow-soft">
            <div className="w-12 h-12 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
              <FiZap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">
              Lightning Fast
            </h3>
            <p className="text-muted-foreground text-sm">
              Real-time messaging with instant delivery and read receipts
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card shadow-soft">
            <div className="w-12 h-12 rounded-full gradient-accent mx-auto mb-4 flex items-center justify-center">
              <MdOutlineShield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">
              Secure & Private
            </h3>
            <p className="text-muted-foreground text-sm">
              End-to-end encryption keeps your conversations safe
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card shadow-soft">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-destructive mx-auto mb-4 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">
              Connect Easily
            </h3>
            <p className="text-muted-foreground text-sm">
              Group chats, voice calls, and media sharing made simple
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


