// import LandingPage from "@/pages/landing.page";

// export default function Home() {
//   return (
//     <main className="flex items-center justify-center h-screen bg-black text-white">
//       <LandingPage/>
//     </main>
//   );
// }
"use client"
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    
    const script = document.createElement('script');
    script.src = 'https://api.kmzview.com/js/KMZView.js';
    script.async = true;
    script.onload = () => {
      if (window.KMZView) {
        window.KMZView.init(document.getElementById('kmzv-container'), {
          LeftSideControlsTop: '80px',
          LeftSideControlsBottom: '40px',
          RightSideControlsTop: '14px',
          RightSideControlsBottom: '200px',
          ShowMapControl: false,
          FillRate: 0.1,
          MapOpts: {
            bounds: [
              [-180, -90],
              [180, 90]
            ],
            antialias: true,
            fadeDuration: 0,
            logoPosition: 'bottom-left',
            performanceMetricsCollection: false,
            attributionControl: false
          }
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      
    };
  }, []);

  return <div id="kmzv-container"></div>;
}

