import MainLayout from "./Layout/MainLayout";
import ProtectedRoute from "./Layout/ProtectedRoute";

function App() {
  return (
    <>
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    </>
  );
}

export default App;
