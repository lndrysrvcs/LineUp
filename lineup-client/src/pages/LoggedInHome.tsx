import { useAuth0 } from "@auth0/auth0-react";

const LoggedInHome = () => {
  const { user } = useAuth0();
  console.log(user);
  return (
    <div className="home">
      Congrats, <b>{user?.name}</b>! You're logged in!
    </div>
  );
};

export default LoggedInHome;
