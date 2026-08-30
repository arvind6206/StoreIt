import Image from "next/image";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <section className='bg-brand p-10'>
        <div>
          <Image
            src="/logo.png"
            alt="logo"
            width={224}
            height={82}
            className="h-auto"
          
          />

          <div className='space-y-5 text-white'>
            <h1 className='h1'>Manage yout files the best way</h1>
            <p className='body-1'>
                This is a place where you can store all your documents.
            </p>
          </div>

          <Image src='/illustration.png' alt="Files" width={342} height={342}
          className='transition-all hover:rotate-2 hover:scale-105'/>

        </div>
      </section>
      {children}
    </div>
  );
};

export default layout;
