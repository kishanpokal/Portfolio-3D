import useGameStore from '../../store/useGameStore';

export default function FastTravelMenu() {
  const { currentLocation, teleportTo, isTransitioning } = useGameStore();

  return (
    <div className="fast-travel-menu">
      <div className="nav-container">
        <h1 className="title">THE V.O.I.D.</h1>
        <nav className="nav-links">
          <button 
            className={`nav-btn ${currentLocation === 'overworld' ? 'active' : ''}`}
            onClick={() => teleportTo('overworld')}
            disabled={isTransitioning}
          >
            Basecamp
          </button>
          <button 
            className={`nav-btn ${currentLocation === 'void-island-1' ? 'active' : ''}`}
            onClick={() => teleportTo('void-island-1')}
            disabled={isTransitioning}
          >
            About Me (Identity)
          </button>
          <button 
            className={`nav-btn ${currentLocation === 'void-island-2' ? 'active' : ''}`}
            onClick={() => teleportTo('void-island-2')}
            disabled={isTransitioning}
          >
            Journey (Time)
          </button>
          <button 
            className={`nav-btn ${currentLocation === 'void-island-3' ? 'active' : ''}`}
            onClick={() => teleportTo('void-island-3')}
            disabled={isTransitioning}
          >
            Projects (Creation)
          </button>
        </nav>
      </div>
      
      {/* Recruiter 5-second path requirement: Instant resume access */}
      <a href="/resume.pdf" download className="download-btn" onClick={(e) => {
        // Prevent default if no file exists yet so it doesn't navigate away during dev
        // In prod, this will trigger the download
        if (process.env.NODE_ENV === 'development') {
           console.log('Downloading resume.pdf');
           // e.preventDefault(); 
        }
      }}>
        Download Resume
      </a>
    </div>
  );
}
