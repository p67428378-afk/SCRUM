
import React from 'react';

const Header = () => {
  return (
    <nav className="bg-background w-full py-lg max-w-container-max mx-auto px-md flex justify-center items-center">
      <div className="flex justify-between items-center w-full max-w-3xl">
        <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">Todo App</h1>
        <div className="flex gap-md items-center">
          <div className="hidden md:flex gap-md">
            <a className="text-primary font-bold border-b-2 border-primary text-body-md font-body-md" href="#">My Tasks</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-body-md font-body-md" href="#">Completed</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-body-md font-body-md" href="#">Settings</a>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvMDT5XIjl2QBO_ZakPTahiWVG2-9ztdWTj1_vNgw61JcICLRr_3amo8HWxNKQikpyPgTvkbg9BSFU02i2lOV2CUSFBy1GWgYaZS1OfTH42mo_HEgml--Fkqc1Q9bNMdd1zuyaHzvYtyGWpligA0s8fOcQIBxLVjz_cACxLvhSb4AgFcvflSWm__T0EAqld8MlEOLeTsB8k6qj4KuLEyNqtWdxzcFVK6yf9gDjADmdXoso7NDdk4SX-nIE0EJEbYh8sMHSV8lsMrmj"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
