import React from "react";
import MFAForm from "../components/auth/MFAForm";

const MFAVerificationPage = ({
  userId,
  username,
  onVerificationSuccess,
  onCancel,
}) => {
  return (
    <main className="flex w-full min-h-screen">
      {/* Left Pane: Security Showcase */}
      <section className="hidden lg:flex flex-col w-1/2 bg-inverse-surface text-inverse-on-surface relative p-3xl overflow-hidden justify-between">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #4edea3 0%, transparent 40%)",
          }}
        ></div>

        {/* Logo Header */}
        <div className="relative z-10 flex items-center">
          <img
            alt="Apex Bank Logo"
            className="h-12 w-12 mr-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNyoDF3Ka6AHpc-Hw0J-VfanH3duZEPpVn3OICoi_tA0M_QnnA48IUCZDp5WEAGErtTV0OgJpixR_Q683hIjct0_6co-u7H-UdNWQSxIdqvgCYYzKBQJPm9SL4AvohB5SIl9fwI2wwW4O32xQxwtdbI7G8yiTTKVYiVmLVKMp_xtaWHZg8E24LzxZ7GzHJGRYUneGCGQhUKS-sdVYs5kvF9LBLCnaWnXmk6LtQDNAKUyaiFWY5ViFYDPEL8lVz1-aj7LX3_Rul5HG-"
          />
          <span className="font-headline-md text-headline-md font-bold">
            Apex Retail Bank
          </span>
        </div>

        {/* Central Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto w-full my-auto">
          <img
            alt="Digital Shield Security"
            className="w-64 h-64 mb-xl object-contain drop-shadow-2xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCilp3HfvgYt6iOBt7qtjsYFYmvuYcIBBntmU7QeG8sxyahn-3XZXgqyIQ03as7qKay9QXBhxyDepv9KOtrPj9yD7CSVZ2OBdeWMCE5sQ4KUy4uM5TXaIYw8k9agvvDTZUPHnFjhLiHVOznBlDBNYap9wISEGz05QMG-b4xyhz_EmR30ZiJ0e8TkRr5gxWhnF3hD_o65gsdRvi45fpIocrUJF6YodrSLW16vfZmF0VU01O8OWYmmnVZ-QF5dx7f5lPoRUJit5PlorUs"
          />
          <h1 className="font-display-lg text-display-lg mb-md text-on-primary">
            Multi-Factor{" "}
            <span className="text-secondary-fixed">Authentication</span>
          </h1>
          <p className="font-body-lg text-body-lg text-primary-fixed-dim mb-xl">
            We require multi-factor authentication to protect your account from
            unauthorized access.
          </p>
        </div>

        <div className="mt-auto relative z-10"></div>
      </section>

      {/* Right Pane: MFA Form */}
      <section className="flex flex-col w-full lg:w-1/2 bg-surface-bright items-center justify-center p-margin-mobile md:p-2xl relative">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center mb-xl absolute top-lg left-margin-mobile">
          <img
            alt="Apex Bank Logo"
            className="h-8 w-8 mr-xs"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNyoDF3Ka6AHpc-Hw0J-VfanH3duZEPpVn3OICoi_tA0M_QnnA48IUCZDp5WEAGErtTV0OgJpixR_Q683hIjct0_6co-u7H-UdNWQSxIdqvgCYYzKBQJPm9SL4AvohB5SIl9fwI2wwW4O32xQxwtdbI7G8yiTTKVYiVmLVKMp_xtaWHZg8E24LzxZ7GzHJGRYUneGCGQhUKS-sdVYs5kvF9LBLCnaWnXmk6LtQDNAKUyaiFWY5ViFYDPEL8lVz1-aj7LX3_Rul5HG-"
          />
          <span className="font-label-md text-label-md font-bold text-on-surface">
            Apex Bank
          </span>
        </div>

        <MFAForm
          userId={userId}
          username={username}
          onVerificationSuccess={onVerificationSuccess}
          onCancel={onCancel}
        />

        {/* Security Badge Footer */}
        <div className="mt-xl flex items-center justify-center space-x-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">shield_lock</span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">
            Secured by ApexShield | TLS 1.3
          </span>
        </div>
      </section>
    </main>
  );
};

export default MFAVerificationPage;
