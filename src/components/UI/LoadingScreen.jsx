import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // If the loader finishes (or there are no assets to load), hide it
    if (!active) {
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!visible) return null;

  return (
    <div className="loading-screen">
       <div className="spinner" />
       <h2>Entering the V.O.I.D...</h2>
       <p>{Math.round(progress)}%</p>
    </div>
  );
}
