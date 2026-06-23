const Nasa = () => {
  return (
    <iframe
      src="https://eyes.nasa.gov/apps/earth/#/satellites?rate=1"
      title="NASA Eyes on the Earth — Satellites"
      allowFullScreen
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        background: "#000",
        zIndex: 9999,
      }}
    />
  );
};

export default Nasa;