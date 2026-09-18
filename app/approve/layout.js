export default function ApproveLayout({ children }) {
  return (
    <>
      <style>{`
        html, body {
          background-color: #f1f5f9 !important;
          color: #1e293b !important;
          color-scheme: light;
        }
      `}</style>
      {children}
    </>
  );
}
