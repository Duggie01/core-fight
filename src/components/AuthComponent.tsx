import { useAuth } from "../hooks/useAuth.hook";

const AuthComponent = () => {
  const { signUp, login, user, isLoading } = useAuth();

  return (
    <div>
      {user ? (
        <h2>Welcome, {user.username}!</h2>
      ) : (
        <>
          <button onClick={() => login()} disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <button
            onClick={() => signUp("PlayerOne", 1, 0.1)}
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </>
      )}
    </div>
  );
};

export default AuthComponent;
